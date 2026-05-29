package com.example.demo.service;

import com.example.demo.entity.ArExperience;
import com.example.demo.repository.ARExperienceRecordRepository;
import com.example.demo.repository.ArExperienceRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ARProjectServiceTest {

    @Mock
    private ARExperienceRecordRepository recordRepository;

    @Mock
    private UserService userService;

    @Mock
    private ArExperienceRepository arExperienceRepository;

    @InjectMocks
    private ARProjectService arProjectService;

    @Test
    void listModelCatalog_prefersDatabaseConfiguredGlbModels() {
        ArExperience item = new ArExperience();
        item.setId(101L);
        item.setName("自建青铜器模型");
        item.setImageUrl("/uploads/3D/bronze-cover.jpg");
        item.setModelUrl("/uploads/3D/bronze.glb");
        item.setInstructions("后台配置的讲解说明");

        when(arExperienceRepository.findAll()).thenReturn(List.of(item));

        List<Map<String, Object>> result = arProjectService.listModelCatalog();

        assertEquals(1, result.size());
        assertEquals("101", result.get(0).get("id"));
        assertEquals("自建青铜器模型", result.get(0).get("name"));
        assertEquals("/uploads/3D/bronze.glb", result.get(0).get("modelUrl"));
        assertEquals("后台配置的讲解说明", result.get(0).get("instructions"));
    }

    @Test
    void listModelCatalog_fallsBackWhenDatabaseHasNoGlbModels() {
        ArExperience item = new ArExperience();
        item.setId(102L);
        item.setName("无模型地址");
        item.setImageUrl("/uploads/3D/empty-cover.jpg");
        item.setModelUrl("");

        when(arExperienceRepository.findAll()).thenReturn(List.of(item));

        List<Map<String, Object>> result = arProjectService.listModelCatalog();

        assertFalse(result.isEmpty());
        assertEquals("stone-stele", result.get(0).get("id"));
    }
}
