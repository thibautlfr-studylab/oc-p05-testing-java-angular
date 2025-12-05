package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.payload.request.LoginRequest;
import com.openclassrooms.starterjwt.payload.request.SignupRequest;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User testUser;
    private final String testUserRawPassword = "test!1234";

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("testuser@example.com")
                .firstName("Test")
                .lastName("User")
                .password(passwordEncoder.encode(testUserRawPassword))
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);
    }

    @AfterEach
    void tearDown() {
        if (testUser != null && testUser.getId() != null && userRepository.existsById(testUser.getId())) {
            userRepository.deleteById(testUser.getId());
        }
    }

    @Test
    public void testLoginSuccess() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail(testUser.getEmail());
        loginRequest.setPassword(testUserRawPassword);

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").exists())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.username").value(testUser.getEmail()))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.admin").value(false));
    }

    @Test
    public void testRegisterSuccess() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        // Using a unique email to ensure the test passes on multiple runs
        String uniqueEmail = "newuser" + System.currentTimeMillis() + "@example.com";
        signupRequest.setEmail(uniqueEmail);
        signupRequest.setFirstName("New");
        signupRequest.setLastName("User");
        signupRequest.setPassword("test!1234");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("User registered successfully!"));

        // Verify database - user should be created
        Optional<User> createdUser = userRepository.findByEmail(uniqueEmail);
        assertThat(createdUser).isPresent();
        assertThat(createdUser.get().getFirstName()).isEqualTo("New");
        assertThat(createdUser.get().getLastName()).isEqualTo("User");
        // Verify password is encrypted, not raw
        assertThat(createdUser.get().getPassword()).isNotEqualTo("test!1234");

        // Cleanup this dynamically created user
        if (createdUser.isPresent()) {
            userRepository.deleteById(createdUser.get().getId());
        }
    }

    @Test
    public void testRegisterEmailAlreadyTaken() throws Exception {
        SignupRequest signupRequest = new SignupRequest();
        signupRequest.setEmail(testUser.getEmail()); // Use existing testUser's email
        signupRequest.setFirstName("Another");
        signupRequest.setLastName("User");
        signupRequest.setPassword("test!1234");

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(signupRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Error: Email is already taken!"));
    }
}
