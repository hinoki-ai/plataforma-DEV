-- CreateEnum
CREATE TYPE "EducationalInstitutionType" AS ENUM ('PRESCHOOL', 'BASIC_SCHOOL', 'HIGH_SCHOOL', 'COLLEGE');

-- CreateEnum  
CREATE TYPE "ISCEDLevel" AS ENUM ('LEVEL_0', 'LEVEL_1', 'LEVEL_2', 'LEVEL_3', 'LEVEL_4', 'LEVEL_5', 'LEVEL_6', 'LEVEL_7', 'LEVEL_8');

-- CreateTable
CREATE TABLE "educational_levels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chilean_name" TEXT NOT NULL,
    "ages" TEXT NOT NULL,
    "isced_level" "ISCEDLevel" NOT NULL,
    "institution_types" "EducationalInstitutionType"[],
    "grades" TEXT[],
    "description" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "educational_levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_settings" (
    "id" TEXT NOT NULL,
    "institution_type" "EducationalInstitutionType" NOT NULL,
    "supported_levels" JSONB,
    "custom_grades" JSONB,
    "custom_subjects" JSONB,
    "features_enabled" JSONB,
    "academic_year_config" JSONB,
    "grading_system" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_settings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
-- Note: We'll add this in a separate migration after updating existing school_info

-- Add columns to school_info table
ALTER TABLE "school_info" ADD COLUMN "institution_type" "EducationalInstitutionType" NOT NULL DEFAULT 'PRESCHOOL';
ALTER TABLE "school_info" ADD COLUMN "supported_levels" JSONB;
ALTER TABLE "school_info" ADD COLUMN "custom_grades" JSONB;
ALTER TABLE "school_info" ADD COLUMN "custom_subjects" JSONB;
ALTER TABLE "school_info" ADD COLUMN "educational_config" JSONB;

-- Insert default educational levels
INSERT INTO "educational_levels" ("id", "name", "chilean_name", "ages", "isced_level", "institution_types", "grades", "description", "is_active") VALUES
('sala_cuna', 'Nursery', 'Sala Cuna', '3 meses - 2 años', 'LEVEL_0', ARRAY['PRESCHOOL'], ARRAY[]::TEXT[], 'Atención y cuidado temprano para lactantes y bebés', true),
('nivel_medio_menor', 'Pre-nursery', 'Nivel Medio Menor', '2 - 3 años', 'LEVEL_0', ARRAY['PRESCHOOL'], ARRAY[]::TEXT[], 'Desarrollo inicial de habilidades sociales y motoras', true),
('nivel_medio_mayor', 'Junior Pre-K', 'Nivel Medio Mayor', '3 - 4 años', 'LEVEL_0', ARRAY['PRESCHOOL'], ARRAY[]::TEXT[], 'Preparación para niveles de transición', true),
('nt1', 'Pre-Kindergarten', 'NT1 (Primer Nivel de Transición)', '4 - 5 años', 'LEVEL_0', ARRAY['PRESCHOOL'], ARRAY[]::TEXT[], 'Desarrollo de habilidades comunicativas y sociales', true),
('nt2', 'Kindergarten', 'NT2 (Segundo Nivel de Transición)', '5 - 6 años', 'LEVEL_0', ARRAY['PRESCHOOL'], ARRAY[]::TEXT[], 'Preparación para educación básica', true),
('basic_primary', 'Primary Education', 'Educación Básica Primaria', '6 - 12 años', 'LEVEL_1', ARRAY['BASIC_SCHOOL'], ARRAY['1° Básico', '2° Básico', '3° Básico', '4° Básico', '5° Básico', '6° Básico'], 'Educación fundamental: lectura, escritura, matemáticas básicas', true),
('basic_secondary', 'Lower Secondary Education', 'Educación Básica Secundaria', '12 - 14 años', 'LEVEL_2', ARRAY['BASIC_SCHOOL'], ARRAY['7° Básico', '8° Básico'], 'Consolidación de conocimientos básicos y preparación para educación media', true),
('high_school_scientific', 'Scientific-Humanistic Secondary', 'Educación Media Científico-Humanista', '14 - 18 años', 'LEVEL_3', ARRAY['HIGH_SCHOOL'], ARRAY['1° Medio', '2° Medio', '3° Medio', '4° Medio'], 'Preparación para educación superior universitaria', true),
('high_school_technical', 'Technical-Professional Secondary', 'Educación Media Técnico-Profesional', '14 - 18 años', 'LEVEL_3', ARRAY['HIGH_SCHOOL'], ARRAY['1° Medio TP', '2° Medio TP', '3° Medio TP', '4° Medio TP'], 'Formación técnica especializada para inserción laboral', true),
('post_secondary_technical', 'Post-Secondary Technical', 'Educación Post-Secundaria Técnica', '18+ años', 'LEVEL_4', ARRAY['COLLEGE'], ARRAY[]::TEXT[], 'Especialización técnica post-secundaria', true),
('technical_professional', 'Technical Professional', 'Técnico Profesional', '18+ años', 'LEVEL_5', ARRAY['COLLEGE'], ARRAY[]::TEXT[], 'Formación técnica superior (2-3 años)', true),
('undergraduate', 'Undergraduate / Bachelor''s', 'Educación Universitaria (Pregrado)', '18+ años', 'LEVEL_6', ARRAY['COLLEGE'], ARRAY[]::TEXT[], 'Educación universitaria de pregrado (4-6 años)', true),
('masters', 'Master''s Level', 'Magíster', '22+ años', 'LEVEL_7', ARRAY['COLLEGE'], ARRAY[]::TEXT[], 'Estudios de postgrado nivel magíster (1-2 años)', true),
('doctoral', 'Doctoral Level', 'Doctorado', '24+ años', 'LEVEL_8', ARRAY['COLLEGE'], ARRAY[]::TEXT[], 'Estudios de postgrado nivel doctorado (3-5 años)', true);

-- Insert default institution settings
INSERT INTO "institution_settings" ("id", "institution_type", "supported_levels", "custom_grades", "custom_subjects", "features_enabled") VALUES
('preschool_default', 'PRESCHOOL', '["LEVEL_0"]', '["Sala Cuna", "NT1", "NT2"]', '["Desarrollo Personal y Social", "Comunicación Integral", "Relación con el Medio Natural y Cultural", "Lenguajes Artísticos", "Educación Física y Bienestar"]', '{"parent_meetings": true, "daycare_features": true, "play_based_learning": true}'),
('basic_school_default', 'BASIC_SCHOOL', '["LEVEL_1", "LEVEL_2"]', '["1° Básico", "2° Básico", "3° Básico", "4° Básico", "5° Básico", "6° Básico", "7° Básico", "8° Básico"]', '["Lenguaje y Comunicación", "Matemática", "Historia, Geografía y Ciencias Sociales", "Ciencias Naturales", "Inglés", "Educación Física y Salud", "Artes Visuales", "Música", "Orientación", "Religión"]', '{"parent_meetings": true, "academic_planning": true, "grading_system": true}'),
('high_school_default', 'HIGH_SCHOOL', '["LEVEL_3"]', '["1° Medio", "2° Medio", "3° Medio", "4° Medio"]', '["Lengua y Literatura", "Matemática", "Historia, Geografía y Ciencias Sociales", "Filosofía", "Biología", "Química", "Física", "Inglés", "Educación Física y Salud", "Artes", "Música", "Orientación", "Religión"]', '{"parent_meetings": true, "academic_planning": true, "grading_system": true, "career_guidance": true, "technical_training": true}'),
('college_default', 'COLLEGE', '["LEVEL_4", "LEVEL_5", "LEVEL_6", "LEVEL_7", "LEVEL_8"]', '["1° Año", "2° Año", "3° Año", "4° Año", "Magíster", "Doctorado"]', '["Especialización por Carrera", "Metodología de Investigación", "Tesis/Proyecto de Título"]', '{"academic_planning": true, "grading_system": true, "university_features": true, "thesis_management": true, "research_projects": true}');

-- Create indexes
CREATE INDEX "educational_levels_institution_types_idx" ON "educational_levels" USING GIN ("institution_types");
CREATE INDEX "educational_levels_isced_level_idx" ON "educational_levels"("isced_level");
CREATE INDEX "institution_settings_institution_type_idx" ON "institution_settings"("institution_type");
CREATE INDEX "school_info_institution_type_idx" ON "school_info"("institution_type");