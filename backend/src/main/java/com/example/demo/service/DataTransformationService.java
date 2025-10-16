package com.example.demo.service;

import org.springframework.stereotype.Service;
import java.util.Map;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
public class DataTransformationService {

    /**
     * Transform patient JSON data to SQL INSERT statement
     */
    public String transformPatientToSQL(Map<String, Object> patient) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO person (");

        // Build column list
        sql.append("person_id, gender_concept_id, year_of_birth, month_of_birth, day_of_birth, ");
        sql.append("birth_datetime, race_concept_id, ethnicity_concept_id, location_id, ");
        sql.append("provider_id, care_site_id, person_source_value, gender_source_value, ");
        sql.append("gender_source_concept_id, race_source_value, race_source_concept_id, ");
        sql.append("ethnicity_source_value, ethnicity_source_concept_id");

        sql.append(") VALUES (");

        // Add values
        sql.append(getValueOrNull(patient, "person_id")).append(", ");
        sql.append(getValueOrNull(patient, "gender_concept_id")).append(", ");
        sql.append(getValueOrNull(patient, "year_of_birth")).append(", ");
        sql.append(getValueOrNull(patient, "month_of_birth")).append(", ");
        sql.append(getValueOrNull(patient, "day_of_birth")).append(", ");
        sql.append(getDateTimeValue(patient, "birth_datetime")).append(", ");
        sql.append(getValueOrNull(patient, "race_concept_id")).append(", ");
        sql.append(getValueOrNull(patient, "ethnicity_concept_id")).append(", ");
        sql.append(getValueOrNull(patient, "location_id")).append(", ");
        sql.append(getValueOrNull(patient, "provider_id")).append(", ");
        sql.append(getValueOrNull(patient, "care_site_id")).append(", ");
        sql.append(getStringValue(patient, "person_source_value")).append(", ");
        sql.append(getStringValue(patient, "gender_source_value")).append(", ");
        sql.append(getValueOrNull(patient, "gender_source_concept_id")).append(", ");
        sql.append(getStringValue(patient, "race_source_value")).append(", ");
        sql.append(getValueOrNull(patient, "race_source_concept_id")).append(", ");
        sql.append(getStringValue(patient, "ethnicity_source_value")).append(", ");
        sql.append(getValueOrNull(patient, "ethnicity_source_concept_id"));

        sql.append(")");

        return sql.toString();
    }

    /**
     * Transform generic data to SQL based on data type
     */
    public String transformDataToSQL(Map<String, Object> data, String dataType) {
        switch (dataType.toLowerCase()) {
            case "condition":
                return transformConditionToSQL(data);
            case "drug":
                return transformDrugToSQL(data);
            case "measurement":
                return transformMeasurementToSQL(data);
            case "visit":
                return transformVisitToSQL(data);
            default:
                throw new IllegalArgumentException("Unsupported data type: " + dataType);
        }
    }

    /**
     * Transform condition JSON data to SQL INSERT statement
     */
    public String transformConditionToSQL(Map<String, Object> condition) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO condition_occurrence (");

        sql.append("condition_occurrence_id, person_id, condition_concept_id, condition_start_date, ");
        sql.append("condition_start_datetime, condition_end_date, condition_end_datetime, ");
        sql.append("condition_type_concept_id, condition_status_concept_id, stop_reason, ");
        sql.append("provider_id, visit_occurrence_id, visit_detail_id, condition_source_value, ");
        sql.append("condition_source_concept_id, condition_status_source_value");

        sql.append(") VALUES (");

        sql.append(getValueOrNull(condition, "condition_occurrence_id")).append(", ");
        sql.append(getValueOrNull(condition, "person_id")).append(", ");
        sql.append(getValueOrNull(condition, "condition_concept_id")).append(", ");
        sql.append(getDateValue(condition, "condition_start_date")).append(", ");
        sql.append(getDateTimeValue(condition, "condition_start_datetime")).append(", ");
        sql.append(getDateValue(condition, "condition_end_date")).append(", ");
        sql.append(getDateTimeValue(condition, "condition_end_datetime")).append(", ");
        sql.append(getValueOrNull(condition, "condition_type_concept_id")).append(", ");
        sql.append(getValueOrNull(condition, "condition_status_concept_id")).append(", ");
        sql.append(getStringValue(condition, "stop_reason")).append(", ");
        sql.append(getValueOrNull(condition, "provider_id")).append(", ");
        sql.append(getValueOrNull(condition, "visit_occurrence_id")).append(", ");
        sql.append(getValueOrNull(condition, "visit_detail_id")).append(", ");
        sql.append(getStringValue(condition, "condition_source_value")).append(", ");
        sql.append(getValueOrNull(condition, "condition_source_concept_id")).append(", ");
        sql.append(getStringValue(condition, "condition_status_source_value"));

        sql.append(")");

        return sql.toString();
    }

    /**
     * Transform drug JSON data to SQL INSERT statement
     */
    public String transformDrugToSQL(Map<String, Object> drug) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO drug_exposure (");

        sql.append("drug_exposure_id, person_id, drug_concept_id, drug_exposure_start_date, ");
        sql.append("drug_exposure_start_datetime, drug_exposure_end_date, drug_exposure_end_datetime, ");
        sql.append("verbatim_end_date, drug_type_concept_id, stop_reason, refills, quantity, ");
        sql.append("days_supply, sig, route_concept_id, lot_number, provider_id, ");
        sql.append("visit_occurrence_id, visit_detail_id, drug_source_value, drug_source_concept_id, ");
        sql.append("route_source_value, dose_unit_source_value");

        sql.append(") VALUES (");

        sql.append(getValueOrNull(drug, "drug_exposure_id")).append(", ");
        sql.append(getValueOrNull(drug, "person_id")).append(", ");
        sql.append(getValueOrNull(drug, "drug_concept_id")).append(", ");
        sql.append(getDateValue(drug, "drug_exposure_start_date")).append(", ");
        sql.append(getDateTimeValue(drug, "drug_exposure_start_datetime")).append(", ");
        sql.append(getDateValue(drug, "drug_exposure_end_date")).append(", ");
        sql.append(getDateTimeValue(drug, "drug_exposure_end_datetime")).append(", ");
        sql.append(getDateValue(drug, "verbatim_end_date")).append(", ");
        sql.append(getValueOrNull(drug, "drug_type_concept_id")).append(", ");
        sql.append(getStringValue(drug, "stop_reason")).append(", ");
        sql.append(getValueOrNull(drug, "refills")).append(", ");
        sql.append(getValueOrNull(drug, "quantity")).append(", ");
        sql.append(getValueOrNull(drug, "days_supply")).append(", ");
        sql.append(getStringValue(drug, "sig")).append(", ");
        sql.append(getValueOrNull(drug, "route_concept_id")).append(", ");
        sql.append(getStringValue(drug, "lot_number")).append(", ");
        sql.append(getValueOrNull(drug, "provider_id")).append(", ");
        sql.append(getValueOrNull(drug, "visit_occurrence_id")).append(", ");
        sql.append(getValueOrNull(drug, "visit_detail_id")).append(", ");
        sql.append(getStringValue(drug, "drug_source_value")).append(", ");
        sql.append(getValueOrNull(drug, "drug_source_concept_id")).append(", ");
        sql.append(getStringValue(drug, "route_source_value")).append(", ");
        sql.append(getStringValue(drug, "dose_unit_source_value"));

        sql.append(")");

        return sql.toString();
    }

    /**
     * Transform measurement JSON data to SQL INSERT statement
     */
    public String transformMeasurementToSQL(Map<String, Object> measurement) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO measurement (");

        sql.append("measurement_id, person_id, measurement_concept_id, measurement_date, ");
        sql.append("measurement_datetime, measurement_time, measurement_type_concept_id, ");
        sql.append("operator_concept_id, value_as_number, value_as_concept_id, unit_concept_id, ");
        sql.append("range_low, range_high, provider_id, visit_occurrence_id, visit_detail_id, ");
        sql.append("measurement_source_value, measurement_source_concept_id, unit_source_value, ");
        sql.append("value_source_value");

        sql.append(") VALUES (");

        sql.append(getValueOrNull(measurement, "measurement_id")).append(", ");
        sql.append(getValueOrNull(measurement, "person_id")).append(", ");
        sql.append(getValueOrNull(measurement, "measurement_concept_id")).append(", ");
        sql.append(getDateValue(measurement, "measurement_date")).append(", ");
        sql.append(getDateTimeValue(measurement, "measurement_datetime")).append(", ");
        sql.append(getStringValue(measurement, "measurement_time")).append(", ");
        sql.append(getValueOrNull(measurement, "measurement_type_concept_id")).append(", ");
        sql.append(getValueOrNull(measurement, "operator_concept_id")).append(", ");
        sql.append(getValueOrNull(measurement, "value_as_number")).append(", ");
        sql.append(getValueOrNull(measurement, "value_as_concept_id")).append(", ");
        sql.append(getValueOrNull(measurement, "unit_concept_id")).append(", ");
        sql.append(getValueOrNull(measurement, "range_low")).append(", ");
        sql.append(getValueOrNull(measurement, "range_high")).append(", ");
        sql.append(getValueOrNull(measurement, "provider_id")).append(", ");
        sql.append(getValueOrNull(measurement, "visit_occurrence_id")).append(", ");
        sql.append(getValueOrNull(measurement, "visit_detail_id")).append(", ");
        sql.append(getStringValue(measurement, "measurement_source_value")).append(", ");
        sql.append(getValueOrNull(measurement, "measurement_source_concept_id")).append(", ");
        sql.append(getStringValue(measurement, "unit_source_value")).append(", ");
        sql.append(getStringValue(measurement, "value_source_value"));

        sql.append(")");

        return sql.toString();
    }

    /**
     * Transform visit JSON data to SQL INSERT statement
     */
    public String transformVisitToSQL(Map<String, Object> visit) {
        StringBuilder sql = new StringBuilder();
        sql.append("INSERT INTO visit_occurrence (");

        sql.append("visit_occurrence_id, person_id, visit_concept_id, visit_start_date, ");
        sql.append("visit_start_datetime, visit_end_date, visit_end_datetime, ");
        sql.append("visit_type_concept_id, provider_id, care_site_id, visit_source_value, ");
        sql.append("visit_source_concept_id, admitted_from_concept_id, admitted_from_source_value, ");
        sql.append("discharge_to_concept_id, discharge_to_source_value, preceding_visit_occurrence_id");

        sql.append(") VALUES (");

        sql.append(getValueOrNull(visit, "visit_occurrence_id")).append(", ");
        sql.append(getValueOrNull(visit, "person_id")).append(", ");
        sql.append(getValueOrNull(visit, "visit_concept_id")).append(", ");
        sql.append(getDateValue(visit, "visit_start_date")).append(", ");
        sql.append(getDateTimeValue(visit, "visit_start_datetime")).append(", ");
        sql.append(getDateValue(visit, "visit_end_date")).append(", ");
        sql.append(getDateTimeValue(visit, "visit_end_datetime")).append(", ");
        sql.append(getValueOrNull(visit, "visit_type_concept_id")).append(", ");
        sql.append(getValueOrNull(visit, "provider_id")).append(", ");
        sql.append(getValueOrNull(visit, "care_site_id")).append(", ");
        sql.append(getStringValue(visit, "visit_source_value")).append(", ");
        sql.append(getValueOrNull(visit, "visit_source_concept_id")).append(", ");
        sql.append(getValueOrNull(visit, "admitted_from_concept_id")).append(", ");
        sql.append(getStringValue(visit, "admitted_from_source_value")).append(", ");
        sql.append(getValueOrNull(visit, "discharge_to_concept_id")).append(", ");
        sql.append(getStringValue(visit, "discharge_to_source_value")).append(", ");
        sql.append(getValueOrNull(visit, "preceding_visit_occurrence_id"));

        sql.append(")");

        return sql.toString();
    }

    // Helper methods for value formatting
    private String getValueOrNull(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            return "NULL";
        }
        return value.toString();
    }

    private String getStringValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            return "NULL";
        }
        // Escape single quotes for SQL
        String stringValue = value.toString().replace("'", "''");
        return "'" + stringValue + "'";
    }

    private String getDateValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            return "NULL";
        }

        String dateString = value.toString();
        try {
            // Try to parse and format the date to ensure it's valid
            LocalDate date = LocalDate.parse(dateString);
            return "'" + date.format(DateTimeFormatter.ISO_LOCAL_DATE) + "'";
        } catch (Exception e) {
            // If parsing fails, return as string but warn
            return "'" + dateString + "'";
        }
    }

    private String getDateTimeValue(Map<String, Object> data, String key) {
        Object value = data.get(key);
        if (value == null) {
            return "NULL";
        }

        String dateTimeString = value.toString();
        return "'" + dateTimeString + "'";
    }
}