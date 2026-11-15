package com.staffsync.controller;

import com.staffsync.model.SystemSetting;
import com.staffsync.service.SystemSettingService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/super-admin/settings")
@CrossOrigin(
	    origins = {
	        "http://localhost:5173",
	        "http://127.0.0.1:5173",
	        "https://staffsync-75b.pages.dev"
	    },
	    allowCredentials = "true"
	)
public class SuperAdminSettingsController {

	private final SystemSettingService systemSettingService;

	public SuperAdminSettingsController(SystemSettingService systemSettingService) {
		this.systemSettingService = systemSettingService;
	}

	/**
	 * GET /api/super-admin/settings
	 *
	 * Returns all settings as key/value pairs.
	 */
	@GetMapping
	public ResponseEntity<Map<String, String>> getSettings() {

		return ResponseEntity.ok(systemSettingService.getSettingsMap());
	}

	/**
	 * GET /api/super-admin/settings/all
	 *
	 * Returns complete setting objects.
	 */
	@GetMapping("/all")
	public ResponseEntity<List<SystemSetting>> getAllSettings() {

		return ResponseEntity.ok(systemSettingService.getAllSettings());
	}

	/**
	 * GET /api/super-admin/settings/{key}
	 */
	@GetMapping("/{key}")
	public ResponseEntity<?> getSetting(@PathVariable String key) {

		try {

			SystemSetting setting = systemSettingService.getSetting(key);

			return ResponseEntity.ok(setting);

		} catch (RuntimeException exception) {

			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", exception.getMessage()));
		}
	}

	/**
	 * PUT /api/super-admin/settings
	 *
	 * Saves all settings received from React.
	 *
	 * Example:
	 *
	 * { "companyName": "StaffSync", "companyEmail": "support@staffsync.com" }
	 */
	@PutMapping
	public ResponseEntity<?> updateSettings(@RequestBody Map<String, String> settings,
			@RequestParam(required = false) Long adminId) {

		try {

			systemSettingService.saveSettings(settings, adminId);

			return ResponseEntity.ok(Map.of("message", "Settings saved successfully", "settings",
					systemSettingService.getSettingsMap()));

		} catch (Exception exception) {

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Failed to save settings", "error", exception.getMessage()));
		}
	}

	/**
	 * PUT /api/super-admin/settings/{key}
	 *
	 * Saves a single setting.
	 */
	@PutMapping("/{key}")
	public ResponseEntity<?> updateSetting(@PathVariable String key, @RequestBody Map<String, String> request,
			@RequestParam(required = false) Long adminId) {

		try {

			String value = request.getOrDefault("value", "");

			String type = request.getOrDefault("type", "STRING");

			String description = request.getOrDefault("description", "StaffSync system setting");

			SystemSetting saved = systemSettingService.saveSetting(key, value, type, description, adminId);

			return ResponseEntity.ok(saved);

		} catch (Exception exception) {

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(Map.of("message", "Failed to save setting", "error", exception.getMessage()));
		}
	}

	/**
	 * DELETE /api/super-admin/settings/{key}
	 */
	@DeleteMapping("/{key}")
	public ResponseEntity<?> deleteSetting(@PathVariable String key) {

		try {

			systemSettingService.deleteSetting(key);

			return ResponseEntity.ok(Map.of("message", "Setting deleted successfully"));

		} catch (RuntimeException exception) {

			return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", exception.getMessage()));
		}
	}
}