package com.openclassrooms.starterjwt.mapper;

import com.openclassrooms.starterjwt.dto.TeacherDto;
import com.openclassrooms.starterjwt.models.Teacher;
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
public class TeacherMapperTest {

    @Autowired
    private TeacherMapper teacherMapper;

    private Teacher teacher;
    private TeacherDto teacherDto;
    private LocalDateTime now;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.now();

        teacher = Teacher.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .createdAt(now)
                .updatedAt(now)
                .build();

        teacherDto = new TeacherDto();
        teacherDto.setId(2L);
        teacherDto.setFirstName("Jane");
        teacherDto.setLastName("Smith");
        teacherDto.setCreatedAt(now);
        teacherDto.setUpdatedAt(now);
    }

    @Test
    public void testToDto_shouldConvertEntityToDto() {
        // When
        TeacherDto result = teacherMapper.toDto(teacher);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(teacher.getId());
        assertThat(result.getFirstName()).isEqualTo(teacher.getFirstName());
        assertThat(result.getLastName()).isEqualTo(teacher.getLastName());
        assertThat(result.getCreatedAt()).isEqualTo(teacher.getCreatedAt());
        assertThat(result.getUpdatedAt()).isEqualTo(teacher.getUpdatedAt());
    }

    @Test
    public void testToDto_withNullEntity_shouldReturnNull() {
        // When
        TeacherDto result = teacherMapper.toDto((Teacher) null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    public void testToEntity_shouldConvertDtoToEntity() {
        // When
        Teacher result = teacherMapper.toEntity(teacherDto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(teacherDto.getId());
        assertThat(result.getFirstName()).isEqualTo(teacherDto.getFirstName());
        assertThat(result.getLastName()).isEqualTo(teacherDto.getLastName());
        assertThat(result.getCreatedAt()).isEqualTo(teacherDto.getCreatedAt());
        assertThat(result.getUpdatedAt()).isEqualTo(teacherDto.getUpdatedAt());
    }

    @Test
    public void testToEntity_withNullDto_shouldReturnNull() {
        // When
        Teacher result = teacherMapper.toEntity((TeacherDto) null);

        // Then
        assertThat(result).isNull();
    }

    @Test
    public void testToDto_withList_shouldConvertEntityListToDtoList() {
        // Given
        Teacher teacher2 = Teacher.builder()
                .id(3L)
                .firstName("Bob")
                .lastName("Johnson")
                .createdAt(now)
                .updatedAt(now)
                .build();
        List<Teacher> teachers = Arrays.asList(teacher, teacher2);

        // When
        List<TeacherDto> result = teacherMapper.toDto(teachers);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(teacher.getId());
        assertThat(result.get(0).getFirstName()).isEqualTo(teacher.getFirstName());
        assertThat(result.get(1).getId()).isEqualTo(teacher2.getId());
        assertThat(result.get(1).getFirstName()).isEqualTo(teacher2.getFirstName());
    }

    @Test
    public void testToEntity_withList_shouldConvertDtoListToEntityList() {
        // Given
        TeacherDto teacherDto2 = new TeacherDto();
        teacherDto2.setId(4L);
        teacherDto2.setFirstName("Alice");
        teacherDto2.setLastName("Brown");
        teacherDto2.setCreatedAt(now);
        teacherDto2.setUpdatedAt(now);
        List<TeacherDto> teacherDtos = Arrays.asList(teacherDto, teacherDto2);

        // When
        List<Teacher> result = teacherMapper.toEntity(teacherDtos);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(2);
        assertThat(result.get(0).getId()).isEqualTo(teacherDto.getId());
        assertThat(result.get(0).getFirstName()).isEqualTo(teacherDto.getFirstName());
        assertThat(result.get(1).getId()).isEqualTo(teacherDto2.getId());
        assertThat(result.get(1).getFirstName()).isEqualTo(teacherDto2.getFirstName());
    }

    @Test
    public void testToDto_withEmptyList_shouldReturnEmptyList() {
        // Given
        List<Teacher> emptyList = Collections.emptyList();

        // When
        List<TeacherDto> result = teacherMapper.toDto(emptyList);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void testToEntity_withEmptyList_shouldReturnEmptyList() {
        // Given
        List<TeacherDto> emptyList = Collections.emptyList();

        // When
        List<Teacher> result = teacherMapper.toEntity(emptyList);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).isEmpty();
    }

    @Test
    public void testToDto_withNullFields_shouldHandleNullFields() {
        // Given
        Teacher teacherWithNulls = Teacher.builder()
                .id(5L)
                .firstName(null)
                .lastName(null)
                .createdAt(null)
                .updatedAt(null)
                .build();

        // When
        TeacherDto result = teacherMapper.toDto(teacherWithNulls);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(5L);
        assertThat(result.getFirstName()).isNull();
        assertThat(result.getLastName()).isNull();
        assertThat(result.getCreatedAt()).isNull();
        assertThat(result.getUpdatedAt()).isNull();
    }
}
