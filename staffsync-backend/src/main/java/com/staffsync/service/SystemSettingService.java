package com.staffsync.service;

import com.staffsync.model.SystemSetting;
import com.staffsync.repository.SystemSettingRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class SystemSettingService {

	private final SystemSettingRepository systemSettingRepository;

	public SystemSettingService(SystemSettingRepository systemSettingRepository) {
		this.systemSettingRepository = systemSettingRepository;
	}

	/**
	 * Get all settings.
	 */
	public List<SystemSetting> getAllSettings() {
		return systemSettingRepository.findAll();
	}

	/**
	 * Get settings as key/value map. This format is convenient for the React
	 * frontend.
	 */
	public Map<String, String> getSettingsMap() {

		List<SystemSetting> settings = systemSettingRepository.findAll();

		Map<String, String> result = new LinkedHashMap<>();

		for (SystemSetting setting : settings) {
			result.put(setting.getSettingKey(), setting.getSettingValue());
		}

		return result;
	}

	/**
	 * Get one setting by key.
	 */
	public SystemSetting getSetting(String key) {

		return systemSettingRepository.findBySettingKey(key)
				.orElseThrow(() -> new RuntimeException("Setting not found: " + key));
	}

	/**
	 * Get only the value of a setting.
	 */
	public String getSettingValue(String key) {

		return systemSettingRepository.findBySettingKey(key).map(SystemSetting::getSettingValue).orElse(null);
	}

	/**
	 * Create or update a setting.
	 */
	@Transactional
	public SystemSetting saveSetting(String key, String value, String type, String description, Long adminId) {

		SystemSetting setting = systemSettingRepository.findBySettingKey(key).orElseGet(SystemSetting::new);

		setting.setSettingKey(key);
		setting.setSettingValue(value);
		setting.setSettingType(type);
		setting.setDescription(description);
		setting.setUpdatedBy(adminId);

		return systemSettingRepository.save(setting);
	}

	/**
	 * Save multiple settings at once.
	 */
	@Transactional
	public void saveSettings(Map<String, String> settings, Long adminId) {

		if (settings == null || settings.isEmpty()) {
			return;
		}

		for (Map.Entry<String, String> entry : settings.entrySet()) {

			String key = entry.getKey();
			String value = entry.getValue();

			SystemSetting setting = systemSettingRepository.findBySettingKey(key).orElseGet(SystemSetting::new);

			setting.setSettingKey(key);
			setting.setSettingValue(value != null ? value : "");

			/*
			 * If the setting already exists, preserve its original type and description.
			 */
			if (setting.getSettingType() == null) {
				setting.setSettingType(detectType(value));
			}

			if (setting.getDescription() == null) {
				setting.setDescription("StaffSync system setting");
			}

			setting.setUpdatedBy(adminId);

			systemSettingRepository.save(setting);
		}
	}

	/**
	 * Delete a setting.
	 */
	@Transactional
	public void deleteSetting(String key) {

		SystemSetting setting = systemSettingRepository.findBySettingKey(key)
				.orElseThrow(() -> new RuntimeException("Setting not found: " + key));

		systemSettingRepository.delete(setting);
	}

	/**
	 * Detect basic setting type.
	 */
	private String detectType(String value) {

		if (value == null) {
			return "STRING";
		}

		if ("true".equalsIgnoreCase(value) || "false".equalsIgnoreCase(value)) {

			return "BOOLEAN";
		}

		try {
			Integer.parseInt(value);
			return "INTEGER";
		} catch (NumberFormatException ignored) {
		}

		return "STRING";
	}
}