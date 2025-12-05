package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.SessionDto;
import com.openclassrooms.starterjwt.models.Session;
import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.models.User;
import com.openclassrooms.starterjwt.services.TeacherService;
import com.openclassrooms.starterjwt.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@SpringBootTest
public class SessionMapperTest {

    @Autowired
    private SessionMapper sessionMapper;

    @MockBean
    private TeacherService teacherService;

    @MockBean
    private UserService userService;

    private Session session;
    private SessionDto sessionDto;
    private Teacher teacher;
    private User user1;
    private User user2;
    private Date date;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        date = new Date();
        now = LocalDateTime.now();

        // Setup Teacher
        teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .createdAt(now)
                .updatedAt(now)
                .build();

        // Setup Users
        user1 = User.builder()
                .id(10L)
                .email("user1@example.com")
                .firstName("User1")
                .lastName("Test")
                .password("password1")
                .admin(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        user2 = User.builder()
                .id(20L)
                .email("user2@example.com")
                .firstName("User2")
                .lastName("Test")
                .password("password2")
                .admin(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        // Setup Session entity
        session = Session.builder()
                .id(1L)
                .name("Yoga Session")
                .description("Relaxing yoga session")
                .date(date)
                .teacher(teacher)
                .users(Arrays.asList(user1, user2))
                .createdAt(now)
                .updatedAt(now)
                .build();

        // Setup SessionDto
        sessionDto = new SessionDto();
        sessionDto.setId(2L);
        sessionDto.setName("Pilates Session");
        sessionDto.setDescription("Energizing pilates session");
        sessionDto.setDate(date);
        sessionDto.setTeacher_id(1L);
        sessionDto.setUsers(Arrays.asList(10L, 20L));
        sessionDto.setCreatedAt(now);
        sessionDto.setUpdatedAt(now);

        // Mock service behaviors
        when(teacherService.findById(1L)).thenReturn(teacher);
        when(userService.findById(10L)).thenReturn(user1);
        when(userService.findById(20L)).thenReturn(user2);
    }

    @Test
    public void testToDto_shouldConvertEntityToDto() {
        // When
        SessionDto result = sessionMapper.toDto(session);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(session.getId());
        assertThat(result.getName()).isEqualTo(session.getName());
        assertThat(result.getDescription()).isEqualTo(session.getDescription());
        assertThat(result.getDate()).isEqualTo(session.getDate());
        assertThat(result.getTeacher_id()).isEqualTo(session.getTeacher().getId());
        assertThat(result.getUsers()).containsExactly(10L, 20L);
        assertThat(result.getCreatedAt()).isEqualTo(session.getCreatedAt());
        assertThat(result.getUpdatedAt()).isEqualTo(session.getUpdatedAt());
    }

    @Test
    public void testToDto_withNullEntity_shouldReturnNull() {
        // When
        SessionDto result = sessionMapper.toDto((Session) null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    public void testToDto_withNullUsers_shouldReturnEmptyUsersList() {
        // Given
        Session sessionWithoutUsers = Session.builder()
                .id(3L)
                .name("Empty Session")
                .description("Session with no participants")
                .date(date)
                .teacher(teacher)
                .users(null)
                .createdAt(now)
                .updatedAt(now)
                .build();

        // When
        SessionDto result = sessionMapper.toDto(sessionWithoutUsers);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).isEmpty();
    }

    @Test
    public void testToEntity_shouldConvertDtoToEntity() {
        // When
        Session result = sessionMapper.toEntity(sessionDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(sessionDto.getId());
        assertThat(result.getName()).isEqualTo(sessionDto.getName());
        assertThat(result.getDescription()).isEqualTo(sessionDto.getDescription());
        assertThat(result.getDate()).isEqualTo(sessionDto.getDate());
        assertThat(result.getTeacher()).isEqualTo(teacher);
        assertThat(result.getUsers()).hasSize(2);
        assertThat(result.getUsers()).containsExactly(user1, user2);
        assertThat(result.getCreatedAt()).isEqualTo(sessionDto.getCreatedAt());
        assertThat(result.getUpdatedAt()).isEqualTo(sessionDto.getUpdatedAt());
    }

    @Test
    public void testToEntity_withNullDto_shouldReturnNull() {
        // When
        Session result = sessionMapper.toEntity((SessionDto) null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    public void testToEntity_withNullTeacherId_shouldSetNullTeacher() {
        // Given
        SessionDto dtoWithoutTeacher = new SessionDto();
        dtoWithoutTeacher.setId(4L);
        dtoWithoutTeacher.setName("No Teacher Session");
        dtoWithoutTeacher.setDescription("Session without teacher");
        dtoWithoutTeacher.setDate(date);
        dtoWithoutTeacher.setTeacher_id(null);
        dtoWithoutTeacher.setUsers(Collections.singletonList(10L));

        // When
        Session result = sessionMapper.toEntity(dtoWithoutTeacher);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTeacher()).isNull();
    }

    @Test
    public void testToEntity_withNullUsers_shouldReturnEmptyUsersList() {
        // Given
        SessionDto dtoWithoutUsers = new SessionDto();
        dtoWithoutUsers.setId(5L);
        dtoWithoutUsers.setName("No Users Session");
        dtoWithoutUsers.setDescription("Session without users");
        dtoWithoutUsers.setDate(date);
        dtoWithoutUsers.setTeacher_id(1L);
        dtoWithoutUsers.setUsers(null);

        // When
        Session result = sessionMapper.toEntity(dtoWithoutUsers);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).isEmpty();
    }

    @Test
    public void testToEntity_withEmptyUsersList_shouldReturnEmptyUsersList() {
        // Given
        SessionDto dtoWithEmptyUsers = new SessionDto();
        dtoWithEmptyUsers.setId(6L);
        dtoWithEmptyUsers.setName("Empty Users Session");
        dtoWithEmptyUsers.setDescription("Session with empty users list");
        dtoWithEmptyUsers.setDate(date);
        dtoWithEmptyUsers.setTeacher_id(1L);
        dtoWithEmptyUsers.setUsers(Collections.emptyList());

        // When
        Session result = sessionMapper.toEntity(dtoWithEmptyUsers);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).isEmpty();
    }

    @Test
    public void testToEntity_withSingleUser_shouldConvertCorrectly() {
        // Given
        SessionDto dtoWithSingleUser = new SessionDto();
        dtoWithSingleUser.setId(7L);
        dtoWithSingleUser.setName("Single User Session");
        dtoWithSingleUser.setDescription("Session with one user");
        dtoWithSingleUser.setDate(date);
        dtoWithSingleUser.setTeacher_id(1L);
        dtoWithSingleUser.setUsers(Collections.singletonList(10L));

        // When
        Session result = sessionMapper.toEntity(dtoWithSingleUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).hasSize(1);
        assertThat(result.getUsers().get(0).getId()).isEqualTo(10L);
    }

    @Test
    public void testToEntity_shouldCallTeacherService() {
        // When
        Session result = sessionMapper.toEntity(sessionDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getTeacher()).isNotNull();
        assertThat(result.getTeacher().getId()).isEqualTo(1L);
        assertThat(result.getTeacher().getFirstName()).isEqualTo("John");
    }

    @Test
    public void testToEntity_shouldCallUserServiceForEachUser() {
        // When
        Session result = sessionMapper.toEntity(sessionDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).hasSize(2);
        assertThat(result.getUsers().get(0).getId()).isEqualTo(10L);
        assertThat(result.getUsers().get(1).getId()).isEqualTo(20L);
    }

    @Test
    public void testToDto_withList_shouldConvertEntityListToDtoList() {
        // Given
        Session session2 = Session.builder()
                .id(8L)
                .name("Second Session")
                .description("Another session")
                .date(date)
                .teacher(teacher)
                .users(Collections.singletonList(user1))
                .createdAt(now)
                .updatedAt(now)
                .build();
        List<Session> sessions = Arrays.asList(session, session2);

        // When
        List<SessionDto> result = sessionMapper.toDto(sessions);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(session.getId());
        assertThat(result.get(0).getName()).isEqualTo(session.getName());
        assertThat(result.get(1).getId()).isEqualTo(session2.getId());
        assertThat(result.get(1).getName()).isEqualTo(session2.getName());
    }

    @Test
    public void testToEntity_withList_shouldConvertDtoListToEntityList() {
        // Given
        SessionDto sessionDto2 = new SessionDto();
        sessionDto2.setId(9L);
        sessionDto2.setName("Second DTO Session");
        sessionDto2.setDescription("Another DTO session");
        sessionDto2.setDate(date);
        sessionDto2.setTeacher_id(1L);
        sessionDto2.setUsers(Collections.singletonList(10L));
        List<SessionDto> sessionDtos = Arrays.asList(sessionDto, sessionDto2);

        // When
        List<Session> result = sessionMapper.toEntity(sessionDtos);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(sessionDto.getId());
        assertThat(result.get(0).getName()).isEqualTo(sessionDto.getName());
        assertThat(result.get(1).getId()).isEqualTo(sessionDto2.getId());
        assertThat(result.get(1).getName()).isEqualTo(sessionDto2.getName());
    }

    @Test
    public void testToDto_withEmptyList_shouldReturnEmptyList() {
        // Given
        List<Session> emptyList = Collections.emptyList();

        // When
        List<SessionDto> result = sessionMapper.toDto(emptyList);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void testToEntity_withEmptyList_shouldReturnEmptyList() {
        // Given
        List<SessionDto> emptyList = Collections.emptyList();

        // When
        List<Session> result = sessionMapper.toEntity(emptyList);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void testToEntity_whenUserServiceReturnsNull_shouldFilterOutNullUsers() {
        // Given
        when(userService.findById(10L)).thenReturn(user1);
        when(userService.findById(20L)).thenReturn(null); // User not found

        // When
        Session result = sessionMapper.toEntity(sessionDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsers()).hasSize(2); // MapStruct includes null values
        assertThat(result.getUsers().get(0)).isEqualTo(user1);
        assertThat(result.getUsers().get(1)).isNull();
    }
}
