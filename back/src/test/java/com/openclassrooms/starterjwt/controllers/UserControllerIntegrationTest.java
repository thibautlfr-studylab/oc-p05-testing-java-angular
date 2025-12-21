package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.mapper.UserMapper;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class UserControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @SpyBean
    private UserService userService;

    @SpyBean
    private UserMapper userMapper;

    private User testUser;
    private User otherUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .email("testuser@example.com")
                .firstName("Test")
                .lastName("User")
                .password(passwordEncoder.encode("test!1234"))
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);

        otherUser = User.builder()
                .email("otheruser@example.com")
                .firstName("Other")
                .lastName("User")
                .password(passwordEncoder.encode("test!1234"))
                .admin(false)
                .build();
        otherUser = userRepository.save(otherUser);
    }

    @AfterEach
    void tearDown() {
        if (testUser != null && testUser.getId() != null && userRepository.existsById(testUser.getId())) {
            userRepository.deleteById(testUser.getId());
        }
        if (otherUser != null && otherUser.getId() != null && userRepository.existsById(otherUser.getId())) {
            userRepository.deleteById(otherUser.getId());
        }
    }

    @Test
    @WithMockUser
    public void testFindById() throws Exception {
        mockMvc.perform(get("/api/user/" + testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUser.getId()))
                .andExpect(jsonPath("$.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.admin").value(false))
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.createdAt").exists());

        verify(userService).findById(testUser.getId());
        verify(userMapper).toDto(any(User.class));
    }

    @Test
    public void testFindById_unauthorized() throws Exception {
        mockMvc.perform(get("/api/user/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testFindById_notFound() throws Exception {
        mockMvc.perform(get("/api/user/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testFindById_badRequest() throws Exception {
        mockMvc.perform(get("/api/user/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser@example.com")
    public void testDelete_success() throws Exception {
        mockMvc.perform(delete("/api/user/" + testUser.getId()))
                .andExpect(status().isOk());

        // Verify database - user should be deleted
        Optional<User> deletedUser = userRepository.findById(testUser.getId());
        assertThat(deletedUser).isEmpty();

        // Verify service call
        verify(userService).delete(testUser.getId());
    }

    @Test
    public void testDelete_unauthorized_notAuthenticated() throws Exception {
        mockMvc.perform(delete("/api/user/" + testUser.getId()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testDelete_notFound() throws Exception {
        mockMvc.perform(delete("/api/user/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testDelete_badRequest() throws Exception {
        mockMvc.perform(delete("/api/user/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "otheruser@example.com")
    public void testDelete_unauthorized_differentUser() throws Exception {
        mockMvc.perform(delete("/api/user/" + testUser.getId()))
                .andExpect(status().isUnauthorized());

        // Verify database - user should still exist
        Optional<User> stillExistsUser = userRepository.findById(testUser.getId());
        assertThat(stillExistsUser).isPresent();
    }
}
