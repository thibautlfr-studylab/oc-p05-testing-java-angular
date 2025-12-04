package com.openclassrooms.starterjwt.controllers;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TeacherControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser
    public void testFindById() throws Exception {
        mockMvc.perform(get("/api/teacher/1"))
                .andExpect(status().isOk());
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
                .andExpect(status().isOk());
    }

    @Test
    public void testFindAll_unauthorized() throws Exception {
        mockMvc.perform(get("/api/teacher"))
                .andExpect(status().isUnauthorized());
    }
}
