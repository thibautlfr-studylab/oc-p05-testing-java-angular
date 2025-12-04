package com.openclassrooms.starterjwt.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.openclassrooms.starterjwt.dto.SessionDto;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class SessionControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private SessionDto createSessionDto(String name, String description) {
        SessionDto sessionDto = new SessionDto();
        sessionDto.setName(name);
        sessionDto.setDate(new Date());
        sessionDto.setTeacher_id(1L);
        sessionDto.setDescription(description);
        sessionDto.setUsers(new ArrayList<>());
        return sessionDto;
    }

    @Test
    @WithMockUser
    public void testFindById_success() throws Exception {
        mockMvc.perform(get("/api/session/1"))
                .andExpect(status().isOk());
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
        SessionDto sessionDto = createSessionDto("New Session", "Description");
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk());
    }

    @Test
    public void testCreate_unauthorized() throws Exception {
        SessionDto sessionDto = createSessionDto("New Session", "Description");
        mockMvc.perform(post("/api/session")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testUpdate_success() throws Exception {
        SessionDto sessionDto = createSessionDto("Updated Session", "Updated Description");
        mockMvc.perform(put("/api/session/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isOk());
    }

    @Test
    public void testUpdate_unauthorized() throws Exception {
        SessionDto sessionDto = createSessionDto("Updated Session", "Updated Description");
        mockMvc.perform(put("/api/session/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser
    public void testUpdate_badRequest() throws Exception {
        SessionDto sessionDto = createSessionDto("Updated Session", "Updated Description");
        mockMvc.perform(put("/api/session/abc")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sessionDto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    public void testDelete_success() throws Exception {
        mockMvc.perform(delete("/api/session/1"))
                .andExpect(status().isOk());
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
        mockMvc.perform(post("/api/session/1/participate/1"))
                .andExpect(status().isOk());
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
        // First, participate
        mockMvc.perform(post("/api/session/1/participate/1")).andExpect(status().isOk());
        // Then, no longer participate
        mockMvc.perform(delete("/api/session/1/participate/1"))
                .andExpect(status().isOk());
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
}
