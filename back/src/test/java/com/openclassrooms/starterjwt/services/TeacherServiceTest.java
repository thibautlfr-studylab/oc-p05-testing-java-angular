package com.openclassrooms.starterjwt.services;

import com.openclassrooms.starterjwt.models.Teacher;
import com.openclassrooms.starterjwt.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class TeacherServiceTest {

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private TeacherService teacherService;

    private Teacher teacher1;
    private Teacher teacher2;

    @BeforeEach
    public void setUp() {
        teacher1 = new Teacher();
        teacher1.setId(1L);
        teacher1.setFirstName("John");
        teacher1.setLastName("Doe");

        teacher2 = new Teacher();
        teacher2.setId(2L);
        teacher2.setFirstName("Jane");
        teacher2.setLastName("Smith");
    }

    @Test
    public void testFindAll() {
        // Given
        List<Teacher> teachers = Arrays.asList(teacher1, teacher2);
        when(teacherRepository.findAll()).thenReturn(teachers);

        // When
        List<Teacher> result = teacherService.findAll();

        // Then
        assertEquals(2, result.size());
        assertEquals(teacher1, result.get(0));
        assertEquals(teacher2, result.get(1));
    }

    @Test
    public void testFindById_found() {
        // Given
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher1));

        // When
        Teacher result = teacherService.findById(1L);

        // Then
        assertEquals(teacher1, result);
    }

    @Test
    public void testFindById_notFound() {
        // Given
        when(teacherRepository.findById(3L)).thenReturn(Optional.empty());

        // When
        Teacher result = teacherService.findById(3L);

        // Then
        assertNull(result);
    }
}
