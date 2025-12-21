package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.mapper.SessionMapper;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import com.openclassrooms.starterjwt.services.SessionService;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private TeacherRepository teacherRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @SpyBean
    private SessionService sessionService;

    @SpyBean
    private SessionMapper sessionMapper;

    @SpyBean
    private TeacherService teacherService;

    @SpyBean
    private UserService userService;

    private Teacher testTeacher;
    private User testUser;
    private Session testSession;

    @BeforeEach
    void setUp() {
        // Create teacher first (required for session)
        testTeacher = Teacher.builder()
                .firstName("Test")
                .lastName("Teacher")
                .build();
        testTeacher = teacherRepository.save(testTeacher);

        // Create test user for participation tests
        testUser = User.builder()
                .email("sessiontest@example.com")
                .firstName("Session")
                .lastName("User")
                .password(passwordEncoder.encode("test!1234"))
                .admin(false)
                .build();
        testUser = userRepository.save(testUser);

        // Create test session
        testSession = Session.builder()
                .name("Test Session")
                .description("Test Description")
                .date(new Date())
                .teacher(testTeacher)
                .users(new ArrayList<>())
                .build();
        testSession = sessionRepository.save(testSession);
    }

    @AfterEach
    void tearDown() {
        // Clean up in reverse order of creation
        if (testSession != null && testSession.getId() != null && sessionRepository.existsById(testSession.getId())) {
            sessionRepository.deleteById(testSession.getId());
        }
        if (testUser != null && testUser.getId() != null && userRepository.existsById(testUser.getId())) {
            userRepository.deleteById(testUser.getId());
        }
        if (testTeacher != null && testTeacher.getId() != null && teacherRepository.existsById(testTeacher.getId())) {
            teacherRepository.deleteById(testTeacher.getId());
        }
    }

    private SessionDto createSessionDto(String name, String description, Long teacherId) {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName(name);
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(teacherId);
        sessionDto.setDescription(description);
        sessionDto.setUsers(new ArrayList<>());
        return sessionDto;
    }

    @Test
    @WithMockUser
    public void testFindById_success() throws Exception {
        mockMvc.perform(get("/api/session/" + testSession.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testSession.getId()))
                .andExpect(jsonPath("$.name").value("Test Session"))
                .andExpect(jsonPath("$.description").value("Test Description"))
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.teacher_id").value(testTeacher.getId()))
                .andExpect(jsonPath("$.users").isArray())
                .andExpect(jsonPath("$.users", hasSize(0)))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());

        verify(sessionService).getById(testSession.getId());
        verify(sessionMapper).toDto(any(Session.class));
    }

    @Test
    public void testFindById_unauthorized() throws Exception {
        mockMvc.perform(get("/api/session/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testFindById_notFound() throws Exception {
        mockMvc.perform(get("/api/session/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testFindById_badRequest() throws Exception {
        mockMvc.perform(get("/api/session/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testFindAll_success() throws Exception {
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isOk());
    }

    @Test
    public void testFindAll_unauthorized() throws Exception {
        mockMvc.perform(get("/api/session"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testCreate_success() throws Exception {
        SessionDto sessionDto = createSessionDto("New Session", "New Description", testTeacher.getId());

        MvcResult result = mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.name").value("New Session"))
                .andExpect(jsonPath("$.description").value("New Description"))
                .andExpect(jsonPath("$.teacher_id").value(testTeacher.getId()))
                .andReturn();

        // Get the created session ID from response
        String responseBody = result.getResponse().getContentAsString();
        JsonNode jsonNode = objectMapper.readTree(responseBody);
        Long createdId = jsonNode.get("id").asLong();

        // Verify database - session should be created
        Optional<Session> createdSession = sessionRepository.findById(createdId);
        assertThat(createdSession).isPresent();
        assertThat(createdSession.get().getName()).isEqualTo("New Session");

        // Verify service and mapper calls
        verify(sessionService).create(any(Session.class));
        verify(sessionMapper).toEntity(any(SessionDto.class));
        verify(sessionMapper).toDto(any(Session.class));
        verify(teacherService).findById(testTeacher.getId());

        // Cleanup this dynamically created session
        if (createdSession.isPresent()) {
            sessionRepository.deleteById(createdId);
        }
    }

    @Test
    public void testCreate_unauthorized() throws Exception {
        SessionDto sessionDto = createSessionDto("New Session", "Description", testTeacher.getId());
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testUpdate_success() throws Exception {
        SessionDto updatedDto = createSessionDto("Updated Name", "Updated Description", testTeacher.getId());
        updatedDto.setId(testSession.getId());

        mockMvc.perform(put("/api/session/" + testSession.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.description").value("Updated Description"));

        // Verify database - session should be updated
        Optional<Session> updatedSession = sessionRepository.findById(testSession.getId());
        assertThat(updatedSession).isPresent();
        assertThat(updatedSession.get().getName()).isEqualTo("Updated Name");
        assertThat(updatedSession.get().getDescription()).isEqualTo("Updated Description");

        // Verify service and mapper calls
        verify(sessionService).update(eq(testSession.getId()), any(Session.class));
        verify(sessionMapper).toEntity(any(SessionDto.class));
        verify(sessionMapper).toDto(any(Session.class));
    }

    @Test
    public void testUpdate_unauthorized() throws Exception {
        SessionDto sessionDto = createSessionDto("Updated Session", "Updated Description", testTeacher.getId());
        mockMvc.perform(put("/api/session/" + testSession.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testUpdate_badRequest() throws Exception {
        SessionDto sessionDto = createSessionDto("Updated Session", "Updated Description", testTeacher.getId());
        mockMvc.perform(put("/api/session/abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testDelete_success() throws Exception {
        Long sessionIdToDelete = testSession.getId();

        mockMvc.perform(delete("/api/session/" + sessionIdToDelete))
                .andExpect(status().isOk());

        // Verify database - session should be deleted
        Optional<Session> deletedSession = sessionRepository.findById(sessionIdToDelete);
        assertThat(deletedSession).isEmpty();

        // Verify service call
        verify(sessionService).delete(sessionIdToDelete);
    }

    @Test
    public void testDelete_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/session/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testDelete_notFound() throws Exception {
        mockMvc.perform(delete("/api/session/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testDelete_badRequest() throws Exception {
        mockMvc.perform(delete("/api/session/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testParticipate_success() throws Exception {
        mockMvc.perform(post("/api/session/" + testSession.getId() + "/participate/" + testUser.getId()))
                .andExpect(status().isOk());

        // Verify database - user should be added to session
        Optional<Session> sessionWithParticipant = sessionRepository.findById(testSession.getId());
        assertThat(sessionWithParticipant).isPresent();
        assertThat(sessionWithParticipant.get().getUsers()).hasSize(1);
        assertThat(sessionWithParticipant.get().getUsers().get(0).getId()).isEqualTo(testUser.getId());

        // Verify service call
        verify(sessionService).participate(testSession.getId(), testUser.getId());
    }

    @Test
    public void testParticipate_unauthorized() throws Exception {
        mockMvc.perform(post("/api/session/1/participate/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testParticipate_badRequest() throws Exception {
        mockMvc.perform(post("/api/session/abc/participate/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testNoLongerParticipate_success() throws Exception {
        // First, add user to session
        sessionService.participate(testSession.getId(), testUser.getId());
        reset(sessionService); // Reset mock to verify only the noLongerParticipate call

        // Then, remove user from session
        mockMvc.perform(delete("/api/session/" + testSession.getId() + "/participate/" + testUser.getId()))
                .andExpect(status().isOk());

        // Verify database - user should be removed from session
        Optional<Session> sessionWithoutParticipant = sessionRepository.findById(testSession.getId());
        assertThat(sessionWithoutParticipant).isPresent();
        assertThat(sessionWithoutParticipant.get().getUsers()).isEmpty();

        // Verify service call
        verify(sessionService).noLongerParticipate(testSession.getId(), testUser.getId());
    }

    @Test
    public void testNoLongerParticipate_unauthorized() throws Exception {
        mockMvc.perform(delete("/api/session/1/participate/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testNoLongerParticipate_badRequest() throws Exception {
        mockMvc.perform(delete("/api/session/abc/participate/1"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testParticipate_alreadyParticipating() throws Exception {
        // First participation
        sessionService.participate(testSession.getId(), testUser.getId());

        // Try to participate again - should fail with BadRequestException
        mockMvc.perform(post("/api/session/" + testSession.getId() + "/participate/" + testUser.getId()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testNoLongerParticipate_notParticipating() throws Exception {
        // User never participated, try to remove - should fail with BadRequestException
        mockMvc.perform(delete("/api/session/" + testSession.getId() + "/participate/" + testUser.getId()))
                .andExpect(status().isBadRequest());
    }
}
