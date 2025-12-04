package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.exception.BadRequestException;
import com.openclassrooms.starterjwt.exception.NotFoundException;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.repository.SessionRepository;
import com.openclassrooms.starterjwt.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private SessionService sessionService;

    private Session session;
    private User user;

    @BeforeEach
    public void setUp() {
        session = new Session();
        session.setId(1L);
        session.setName("Test Session");
        session.setUsers(new ArrayList<>());

        user = new User();
        user.setId(1L);
        user.setEmail("test@test.com");
    }

    @Test
    public void testCreate() {
        // Given
        when(sessionRepository.save(session)).thenReturn(session);

        // When
        Session result = sessionService.create(session);

        // Then
        assertEquals(session, result);
    }

    @Test
    public void testDelete() {
        // Given
        Long sessionId = 1L;

        // When
        sessionService.delete(sessionId);

        // Then
        verify(sessionRepository).deleteById(sessionId);
    }

    @Test
    public void testFindAll() {
        // Given
        List<Session> sessions = Collections.singletonList(session);
        when(sessionRepository.findAll()).thenReturn(sessions);

        // When
        List<Session> result = sessionService.findAll();

        // Then
        assertEquals(sessions, result);
    }

    @Test
    public void testGetById_found() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // When
        Session result = sessionService.getById(1L);

        // Then
        assertEquals(session, result);
    }

    @Test
    public void testGetById_notFound() {
        // Given
        when(sessionRepository.findById(2L)).thenReturn(Optional.empty());

        // When
        Session result = sessionService.getById(2L);

        // Then
        assertNull(result);
    }

    @Test
    public void testUpdate() {
        // Given
        when(sessionRepository.save(session)).thenReturn(session);

        // When
        Session result = sessionService.update(1L, session);

        // Then
        assertEquals(session, result);
    }

    @Test
    public void testParticipate_success() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // When
        sessionService.participate(1L, 1L);

        // Then
        assertTrue(session.getUsers().contains(user));
        verify(sessionRepository).save(session);
    }

    @Test
    public void testParticipate_sessionNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(NotFoundException.class, () -> sessionService.participate(1L, 1L));
    }

    @Test
    public void testParticipate_userNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(NotFoundException.class, () -> sessionService.participate(1L, 1L));
    }

    @Test
    public void testParticipate_alreadyParticipating() {
        // Given
        session.getUsers().add(user);
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        // When / Then
        assertThrows(BadRequestException.class, () -> sessionService.participate(1L, 1L));
    }

    @Test
    public void testNoLongerParticipate_success() {
        // Given
        User userTarget = new User();
        userTarget.setId(1L);
        userTarget.setEmail("target@test.com");

        User userStay = new User();
        userStay.setId(2L);
        userStay.setEmail("stay@test.com");

        session.setUsers(new ArrayList<>(Arrays.asList(userTarget, userStay)));

        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // When
        sessionService.noLongerParticipate(1L, 1L);

        // Then
        verify(sessionRepository).save(session);
        assertFalse(session.getUsers().contains(userTarget));
        assertTrue(session.getUsers().contains(userStay));
        assertEquals(1, session.getUsers().size());
    }

    @Test
    public void testNoLongerParticipate_sessionNotFound() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.empty());

        // When / Then
        assertThrows(NotFoundException.class, () -> sessionService.noLongerParticipate(1L, 1L));
    }

    @Test
    public void testNoLongerParticipate_notParticipating() {
        // Given
        when(sessionRepository.findById(1L)).thenReturn(Optional.of(session));

        // When / Then
        assertThrows(BadRequestException.class, () -> sessionService.noLongerParticipate(1L, 1L));
    }
}
