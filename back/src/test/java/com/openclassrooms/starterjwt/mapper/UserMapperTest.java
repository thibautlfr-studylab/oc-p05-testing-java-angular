package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.UserDto;
import com.openclassrooms.starterjwt.models.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class UserMapperTest {

    @Autowired
    private UserMapper userMapper;

    private User user;
    private UserDto userDto;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();

        user = User.builder()
                .id(1L)
                .email("john.doe@example.com")
                .firstName("John")
                .lastName("Doe")
                .password("encryptedPassword123")
                .admin(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        userDto = new UserDto();
        userDto.setId(2L);
        userDto.setEmail("jane.smith@example.com");
        userDto.setFirstName("Jane");
        userDto.setLastName("Smith");
        userDto.setPassword("encryptedPassword456");
        userDto.setAdmin(true);
        userDto.setCreatedAt(now);
        userDto.setUpdatedAt(now);
    }

    @Test
    public void testToDto_shouldConvertEntityToDto() {
        // When
        UserDto result = userMapper.toDto(user);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(user.getId());
        assertThat(result.getEmail()).isEqualTo(user.getEmail());
        assertThat(result.getFirstName()).isEqualTo(user.getFirstName());
        assertThat(result.getLastName()).isEqualTo(user.getLastName());
        assertThat(result.getPassword()).isEqualTo(user.getPassword());
        assertThat(result.isAdmin()).isEqualTo(user.isAdmin());
        assertThat(result.getCreatedAt()).isEqualTo(user.getCreatedAt());
        assertThat(result.getUpdatedAt()).isEqualTo(user.getUpdatedAt());
    }

    @Test
    public void testToDto_withNullEntity_shouldReturnNull() {
        // When
        UserDto result = userMapper.toDto((User) null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    public void testToEntity_shouldConvertDtoToEntity() {
        // When
        User result = userMapper.toEntity(userDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(userDto.getId());
        assertThat(result.getEmail()).isEqualTo(userDto.getEmail());
        assertThat(result.getFirstName()).isEqualTo(userDto.getFirstName());
        assertThat(result.getLastName()).isEqualTo(userDto.getLastName());
        assertThat(result.getPassword()).isEqualTo(userDto.getPassword());
        assertThat(result.isAdmin()).isEqualTo(userDto.isAdmin());
        assertThat(result.getCreatedAt()).isEqualTo(userDto.getCreatedAt());
        assertThat(result.getUpdatedAt()).isEqualTo(userDto.getUpdatedAt());
    }

    @Test
    public void testToEntity_withNullDto_shouldReturnNull() {
        // When
        User result = userMapper.toEntity((UserDto) null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    public void testToDto_withAdminUser_shouldPreserveAdminFlag() {
        // Given
        User adminUser = User.builder()
                .id(3L)
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .password("adminPassword")
                .admin(true)
                .createdAt(now)
                .updatedAt(now)
                .build();

        // When
        UserDto result = userMapper.toDto(adminUser);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isAdmin()).isTrue();
    }

    @Test
    public void testToDto_withList_shouldConvertEntityListToDtoList() {
        // Given
        User user2 = User.builder()
                .id(4L)
                .email("bob@example.com")
                .firstName("Bob")
                .lastName("Johnson")
                .password("password123")
                .admin(false)
                .createdAt(now)
                .updatedAt(now)
                .build();
        List<User> users = Arrays.asList(user, user2);

        // When
        List<UserDto> result = userMapper.toDto(users);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(user.getId());
        assertThat(result.get(0).getEmail()).isEqualTo(user.getEmail());
        assertThat(result.get(1).getId()).isEqualTo(user2.getId());
        assertThat(result.get(1).getEmail()).isEqualTo(user2.getEmail());
    }

    @Test
    public void testToEntity_withList_shouldConvertDtoListToEntityList() {
        // Given
        UserDto userDto2 = new UserDto();
        userDto2.setId(5L);
        userDto2.setEmail("alice@example.com");
        userDto2.setFirstName("Alice");
        userDto2.setLastName("Brown");
        userDto2.setPassword("password456");
        userDto2.setAdmin(true);
        userDto2.setCreatedAt(now);
        userDto2.setUpdatedAt(now);
        List<UserDto> userDtos = Arrays.asList(userDto, userDto2);

        // When
        List<User> result = userMapper.toEntity(userDtos);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(userDto.getId());
        assertThat(result.get(0).getEmail()).isEqualTo(userDto.getEmail());
        assertThat(result.get(1).getId()).isEqualTo(userDto2.getId());
        assertThat(result.get(1).getEmail()).isEqualTo(userDto2.getEmail());
    }

    @Test
    public void testToDto_withEmptyList_shouldReturnEmptyList() {
        // Given
        List<User> emptyList = Collections.emptyList();

        // When
        List<UserDto> result = userMapper.toDto(emptyList);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void testToEntity_withEmptyList_shouldReturnEmptyList() {
        // Given
        List<UserDto> emptyList = Collections.emptyList();

        // When
        List<User> result = userMapper.toEntity(emptyList);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void testToDto_withPasswordField_shouldMapPassword() {
        // Given
        User userWithPassword = User.builder()
                .id(6L)
                .email("test@example.com")
                .firstName("Test")
                .lastName("User")
                .password("secretPassword")
                .admin(false)
                .createdAt(now)
                .updatedAt(now)
                .build();

        // When
        UserDto result = userMapper.toDto(userWithPassword);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPassword()).isEqualTo("secretPassword");
    }

    @Test
    public void testToEntity_withDifferentAdminValues_shouldPreserveAdminFlag() {
        // Given - Non-admin DTO
        UserDto nonAdminDto = new UserDto();
        nonAdminDto.setId(7L);
        nonAdminDto.setEmail("nonadmin@example.com");
        nonAdminDto.setFirstName("Non");
        nonAdminDto.setLastName("Admin");
        nonAdminDto.setPassword("password");
        nonAdminDto.setAdmin(false);
        nonAdminDto.setCreatedAt(now);
        nonAdminDto.setUpdatedAt(now);

        // When
        User result = userMapper.toEntity(nonAdminDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.isAdmin()).isFalse();
    }
}
