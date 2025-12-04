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
        List<Teacher> teachers = Arrays.asList(teacher1, teacher2);
        when(teacherRepository.findAll()).thenReturn(teachers);

        List<Teacher> result = teacherService.findAll();

        assertEquals(2, result.size());
        assertEquals(teacher1, result.get(0));
        assertEquals(teacher2, result.get(1));
    }

    @Test
    public void testFindById_found() {
        when(teacherRepository.findById(1L)).thenReturn(Optional.of(teacher1));

        Teacher result = teacherService.findById(1L);

        assertEquals(teacher1, result);
    }

    @Test
    public void testFindById_notFound() {
        when(teacherRepository.findById(3L)).thenReturn(Optional.empty());

        Teacher result = teacherService.findById(3L);

        assertNull(result);
    }
}
