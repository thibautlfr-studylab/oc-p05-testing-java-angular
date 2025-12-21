package com.openclassrooms.starterjwt.controllers;

import com.openclassrooms.starterjwt.mapper.TeacherMapper;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import com.openclassrooms.starterjwt.services.TeacherService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private TeacherRepository teacherRepository;

    @SpyBean
    private TeacherService teacherService;

    @SpyBean
    private TeacherMapper teacherMapper;

    private Teacher testTeacher1;
    private Teacher testTeacher2;

    @BeforeEach
    void setUp() {
        testTeacher1 = Teacher.builder()
                .firstName("Alice")
                .lastName("Smith")
                .build();
        testTeacher1 = teacherRepository.save(testTeacher1);

        testTeacher2 = Teacher.builder()
                .firstName("Bob")
                .lastName("Johnson")
                .build();
        testTeacher2 = teacherRepository.save(testTeacher2);
    }

    @AfterEach
    void tearDown() {
        if (testTeacher1 != null && testTeacher1.getId() != null) {
            teacherRepository.deleteById(testTeacher1.getId());
        }
        if (testTeacher2 != null && testTeacher2.getId() != null) {
            teacherRepository.deleteById(testTeacher2.getId());
        }
    }

    @Test
    @WithMockUser
    public void testFindById() throws Exception {
        mockMvc.perform(get("/api/teacher/" + testTeacher1.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testTeacher1.getId()))
                .andExpect(jsonPath("$.firstName").value("Alice"))
                .andExpect(jsonPath("$.lastName").value("Smith"))
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.updatedAt").exists());

        verify(teacherService).findById(testTeacher1.getId());
        verify(teacherMapper).toDto(any(Teacher.class));
    }

    @Test
    public void testFindById_unauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testFindById_notFound() throws Exception {
        mockMvc.perform(get("/api/teacher/9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    public void testFindById_badRequest() throws Exception {
        mockMvc.perform(get("/api/teacher/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testFindAll() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))))
                .andExpect(jsonPath("$[*].id", hasItem(testTeacher1.getId().intValue())))
                .andExpect(jsonPath("$[*].id", hasItem(testTeacher2.getId().intValue())));

        verify(teacherService).findAll();
        verify(teacherMapper).toDto(anyList());
    }

    @Test
    public void testFindAll_unauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }
}
