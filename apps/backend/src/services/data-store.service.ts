import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import {
  AuditLogRecord,
  CourseMappingRecord,
  EnrollmentRequestRecord,
  EnrollmentStatus,
  ProfileRecord,
  ProgramRecord,
  RoleCode,
  RoleRecord,
  UserProgramRecord,
  UserStatus,
} from '../types/domain';
import { MoodleService } from './moodle.service';

export interface AuthenticatedUserContext {
  profile: ProfileRecord;
  roles: RoleCode[];
  primaryRole: RoleCode;
}

@Injectable()
export class DataStoreService {
  private supabase: SupabaseClient | null = null;

  // Catálogo oficial de roles (Sección 6)
  private roles: RoleRecord[] = [
    {
      id: 'role-superadmin',
      code: 'superadmin',
      name: 'Superadministrador',
      description: 'Configuración global, usuarios, roles, integraciones, parámetros y auditoría.',
      moodle_archetype: 'manager',
    },
    {
      id: 'role-admin',
      code: 'admin',
      name: 'Administrador',
      description: 'Gestión de usuarios, estados, programas, autorizaciones e inscripciones.',
      moodle_archetype: 'manager',
    },
    {
      id: 'role-coordinador',
      code: 'coordinador',
      name: 'Coordinador',
      description: 'Consulta y gestión de usuarios/programas bajo su ámbito.',
      moodle_archetype: 'coursecreator',
    },
    {
      id: 'role-profesor',
      code: 'profesor',
      name: 'Profesor',
      description: 'Perfil docente, consulta de cursos asignados y acceso al campus.',
      moodle_archetype: 'editingteacher',
    },
    {
      id: 'role-estudiante',
      code: 'estudiante',
      name: 'Estudiante',
      description: 'Perfil, programa, cursos asignados y acceso al campus.',
      moodle_archetype: 'student',
    },
    {
      id: 'role-aspirante',
      code: 'aspirante',
      name: 'Aspirante',
      description: 'Registro, actualización de datos y seguimiento de admisión.',
      moodle_archetype: 'none',
    },
    {
      id: 'role-soporte',
      code: 'soporte',
      name: 'Soporte',
      description: 'Atención operativa limitada y consulta controlada.',
      moodle_archetype: 'none',
    },
  ];

  // Usuarios preconfigurados para demostrar roles diferenciados (CA-05, CA-08, CA-09)
  private profiles: ProfileRecord[] = [
    {
      id: '00000000-0000-4000-8000-000000000006',
      email: 'ivan3172001@gmail.com',
      first_name: 'Iván',
      last_name: '(Administrador)',
      phone: '+52 55 1000 0000',
      status: 'activo',
      moodle_user_id: 1001,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-01T09:00:00Z',
      created_at: '2026-10-01T08:00:00Z',
      updated_at: '2026-10-01T08:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000007',
      email: 'negromante.ba@gmail.com',
      first_name: 'Profesor',
      last_name: 'Titular (negromante.ba)',
      phone: '+52 55 1000 0007',
      status: 'activo',
      moodle_user_id: 2002,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-15T12:00:00Z',
      created_at: '2026-10-02T09:00:00Z',
      updated_at: '2026-10-15T12:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000008',
      email: 'urielgonzalezvargas25@gmail.com',
      first_name: 'Uriel',
      last_name: 'González Vargas',
      phone: '+52 55 1000 0008',
      status: 'activo',
      moodle_user_id: 3003,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-16T12:00:00Z',
      created_at: '2026-10-05T09:00:00Z',
      updated_at: '2026-10-16T12:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000001',
      email: 'admin@iinicia.edu.mx',
      first_name: 'Elena',
      last_name: 'Vargas (Administradora)',
      phone: '+52 55 1000 0001',
      status: 'activo',
      moodle_user_id: null,
      moodle_sync_status: 'sin_sincronizar',
      moodle_last_sync_at: null,
      created_at: '2026-10-01T09:00:00Z',
      updated_at: '2026-10-01T09:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000002',
      email: 'profesor@iinicia.edu.mx',
      first_name: 'Roberto',
      last_name: 'Méndez',
      phone: '+52 55 1000 0002',
      status: 'activo',
      moodle_user_id: 2001,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-15T12:00:00Z',
      created_at: '2026-10-02T10:00:00Z',
      updated_at: '2026-10-15T12:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000003',
      email: 'estudiante1@iinicia.edu.mx',
      first_name: 'Ana Sofía',
      last_name: 'García',
      phone: '+52 55 1000 0003',
      status: 'activo',
      moodle_user_id: 3001,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-16T14:30:00Z',
      created_at: '2026-10-05T11:00:00Z',
      updated_at: '2026-10-16T14:30:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000004',
      email: 'estudiante2@iinicia.edu.mx',
      first_name: 'Carlos Eduardo',
      last_name: 'López',
      phone: '+52 55 1000 0004',
      status: 'activo',
      moodle_user_id: 3002,
      moodle_sync_status: 'sincronizado',
      moodle_last_sync_at: '2026-10-16T15:00:00Z',
      created_at: '2026-10-06T09:30:00Z',
      updated_at: '2026-10-16T15:00:00Z',
    },
    {
      id: '00000000-0000-4000-8000-000000000005',
      email: 'aspirante@iinicia.edu.mx',
      first_name: 'Lucía',
      last_name: 'Fernández',
      phone: '+52 55 1000 0005',
      status: 'pendiente',
      moodle_user_id: null,
      moodle_sync_status: 'sin_sincronizar',
      moodle_last_sync_at: null,
      created_at: '2026-10-19T16:20:00Z',
      updated_at: '2026-10-19T16:20:00Z',
    },
  ];

  // Relación user_roles (Sección 5.1)
  private userRoles: Array<{ user_id: string; role_code: RoleCode; assigned_at: string }> = [
    {
      user_id: '00000000-0000-4000-8000-000000000006',
      role_code: 'admin',
      assigned_at: '2026-10-01T08:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000007',
      role_code: 'profesor',
      assigned_at: '2026-10-02T09:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000008',
      role_code: 'estudiante',
      assigned_at: '2026-10-05T09:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000001',
      role_code: 'admin',
      assigned_at: '2026-10-01T09:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000002',
      role_code: 'profesor',
      assigned_at: '2026-10-02T10:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000003',
      role_code: 'estudiante',
      assigned_at: '2026-10-05T11:00:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000004',
      role_code: 'estudiante',
      assigned_at: '2026-10-06T09:30:00Z',
    },
    {
      user_id: '00000000-0000-4000-8000-000000000005',
      role_code: 'aspirante',
      assigned_at: '2026-10-19T16:20:00Z',
    },
  ];

  // Catálogo de Cursos Especializados en Informática y Sistemas
  private programs: ProgramRecord[] = [
  {
    id: '11111111-1111-4111-8111-111111111101',
    slug: 'desarrollo-web-fullstack-react-nextjs',
    code: 'SIS-WEB-101',
    title: 'Desarrollo Web Full-Stack con React, Next.js y Node.js',
    type: 'curso',
    modality: '100% Online · Campus Virtual Moodle',
    duration: '80 Horas · 4 Módulos',
    summary:
      'Domina el desarrollo de aplicaciones web modernas con TypeScript, React, Next.js, APIs REST en NestJS y bases de datos PostgreSQL.',
    description:
      'Curso práctico de la rama de Informática y Sistemas enfocado en la construcción de arquitecturas web modernas, componentes reactivos, autenticación segura JWT, integración con Supabase y despliegue en la nube.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Módulo 1 · Fundamentos Web y TypeScript',
        subjects: [
          'Arquitectura Cliente-Servidor y Protocolo HTTP/HTTPS',
          'HTML5 Semántico, Accesibilidad WCAG 2.2 y CSS3 Moderno',
          'Diseño Responsivo con Tailwind CSS',
          'JavaScript ES2024+ y Tipado Estático con TypeScript',
          'Control de Versiones con Git y Flujos en GitHub',
        ],
      },
      {
        semester: 2,
        title: 'Módulo 2 · Frontend Profesional con React y Next.js',
        subjects: [
          'Componentes Funcionales, Props y Estado en React 18',
          'Hooks Avanzados (useState, useEffect, useMemo, Custom Hooks)',
          'Enrutamiento con Next.js App Router y Server Components',
          'Manejo de Formularios, Validaciones y Estado Global',
          'Optimización de Rendimiento y Core Web Vitals',
        ],
      },
      {
        semester: 3,
        title: 'Módulo 3 · Backend con Node.js, NestJS y Bases de Datos',
        subjects: [
          'Diseño de APIs RESTful y Controladores en NestJS',
          'Modelado Relacional en PostgreSQL y Supabase',
          'Autenticación JWT, Roles (RBAC) y Row Level Security (RLS)',
          'Integración de Servicios Externos y Webhooks',
          'Pruebas Automatizadas Unitarias y End-to-End (E2E)',
        ],
      },
      {
        semester: 4,
        title: 'Módulo 4 · Despliegue Cloud y Proyecto Integrador',
        subjects: [
          'Contenedorización de Aplicaciones con Docker y Docker Compose',
          'Pipelines de Integración y Entrega Continua (CI/CD)',
          'Monitoreo, Logs de Auditoría y Seguridad OWASP Top 10',
          'Proyecto Final: Plataforma Web Full-Stack en Producción',
        ],
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    slug: 'ciberseguridad-hacking-etico-proteccion-sistemas',
    code: 'SIS-SEC-102',
    title: 'Ciberseguridad, Hacking Ético y Protección de Sistemas',
    type: 'curso',
    modality: '100% Online · Laboratorios en Campus Moodle',
    duration: '70 Horas · 4 Módulos',
    summary:
      'Aprende auditoría de seguridad, pruebas de penetración (Pentesting), endurecimiento de servidores Linux/Windows y defensa de redes.',
    description:
      'Formación especializada en seguridad informática ofensiva y defensiva para identificar vulnerabilidades, proteger infraestructuras críticas, asegurar aplicaciones web y responder ante incidentes cibernéticos.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Módulo 1 · Fundamentos de Ciberseguridad y Redes Seguras',
        subjects: [
          'Principios CIA (Confidencialidad, Integridad y Disponibilidad)',
          'Análisis de Tráfico de Red con Wireshark y TCP/IP',
          'Criptografía Simétrica, Asimétrica, Hashing y Certificados TLS',
          'Configuración de Firewalls, VPNs y Segmentación de Redes',
        ],
      },
      {
        semester: 2,
        title: 'Módulo 2 · Hacking Ético y Pentesting de Sistemas',
        subjects: [
          'Metodologías de Reconocimiento y Escaneo con Nmap',
          'Evaluación de Vulnerabilidades con OpenVAS y Nessus',
          'Auditoría de Aplicaciones Web (OWASP Top 10, SQLi, XSS, CSRF)',
          'Laboratorio Práctico en Entornos Controlados (Kali Linux)',
        ],
      },
      {
        semester: 3,
        title: 'Módulo 3 · Hardening de Servidores y Seguridad Cloud',
        subjects: [
          'Endurecimiento (Hardening) de Servidores Linux y Active Directory',
          'Seguridad en Contenedores Docker y Entornos Cloud',
          'Gestión de Identidades, Accesos Privilegiados (IAM) y MFA',
          'Políticas de Respaldo y Recuperación ante Desastres (DRP)',
        ],
      },
      {
        semester: 4,
        title: 'Módulo 4 · Respuesta a Incidentes y Forense Digital',
        subjects: [
          'Monitoreo SIEM, Detección de Intrusiones (IDS/IPS) y Logs',
          'Análisis Forense Digital y Cadena de Custodia',
          'Normativas Internacionales ISO 27001 y NIST Cybersecurity Framework',
          'Proyecto Final: Informe Ejecutivo y Técnico de Auditoría',
        ],
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    slug: 'inteligencia-artificial-machine-learning-python',
    code: 'SIS-IA-103',
    title: 'Inteligencia Artificial, Machine Learning y Python Aplicado',
    type: 'curso',
    modality: '100% Online · Campus Virtual Moodle',
    duration: '80 Horas · 4 Módulos',
    summary:
      'Desarrolla modelos predictivos, redes neuronales, procesamiento de lenguaje natural (NLP) e integración de IA generativa con Python.',
    description:
      'Curso práctico de informática avanzada que abarca desde la programación científica en Python y análisis exploratorio de datos hasta el entrenamiento y despliegue de modelos de Machine Learning y LLMs.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Módulo 1 · Python para Ciencia de Datos e IA',
        subjects: [
          'Estructuras de Datos y Programación Orientada a Objetos en Python',
          'Cálculo Matricial y Vectorización con NumPy',
          'Manipulación y Limpieza de Datos con Pandas',
          'Visualización de Datos con Matplotlib y Seaborn',
        ],
      },
      {
        semester: 2,
        title: 'Módulo 2 · Machine Learning Supervisado y No Supervisado',
        subjects: [
          'Regresión Lineal, Logística y Árboles de Decisión con Scikit-Learn',
          ' Bosques Aleatorios (Random Forest), SVM y Gradient Boosting',
          'Clustering (K-Means, DBSCAN) y Reducción de Dimensionalidad (PCA)',
          'Validación Cruzada, Métricas de Evaluación y Ajuste de Hiperparámetros',
        ],
      },
      {
        semester: 3,
        title: 'Módulo 3 · Deep Learning y Redes Neuronales',
        subjects: [
          'Arquitectura de Redes Neuronales Artificiales (Perceptrón Multicapa)',
          'Visión por Computadora con Redes Convolucionales (CNN)',
          'Procesamiento de Lenguaje Natural (NLP) y Embeddings',
          'Entrenamiento de Modelos con PyTorch y TensorFlow',
        ],
      },
      {
        semester: 4,
        title: 'Módulo 4 · IA Generativa, LLMs y Despliegue de Modelos (MLOps)',
        subjects: [
          'Integración de APIs de Modelos de Lenguaje (LLMs) y Prompt Engineering',
          'Arquitecturas RAG (Retrieval-Augmented Generation) y Bases Vectoriales',
          'Exposición de Modelos de IA mediante APIs con FastAPI',
          'Proyecto Final: Sistema Inteligente en Producción',
        ],
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    slug: 'arquitectura-cloud-devops-docker-kubernetes',
    code: 'SIS-CLD-104',
    title: 'Arquitectura Cloud, DevOps, Docker y Kubernetes',
    type: 'curso',
    modality: '100% Online · Campus Virtual Moodle',
    duration: '60 Horas · 4 Módulos',
    summary:
      'Automatiza despliegues, administra contenedores Docker, orquesta clústeres Kubernetes y diseña infraestructura como código (IaC).',
    description:
      'Especialización en ingeniería de sistemas e infraestructura en la nube para automatizar el ciclo de vida del software, garantizar alta disponibilidad y escalar microservicios.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Módulo 1 · Administración Linux y Contenedores Docker',
        subjects: [
          'Administración Avanzada de Sistemas Linux y Scripting en Bash',
          'Arquitectura de Contenedores, Imágenes y Dockerfiles Optimizados',
          'Redes, Volúmenes y Orquestación Local con Docker Compose',
          'Registro de Imágenes y Seguridad en Contenedores',
        ],
      },
      {
        semester: 2,
        title: 'Módulo 2 · Integración y Entrega Continua (CI/CD)',
        subjects: [
          'Automatización de Pipelines con GitHub Actions y GitLab CI',
          'Pruebas Automatizadas, Análisis Estático de Código (SonarQube) y Linting',
          'Estrategias de Despliegue (Blue-Green, Canary y Rolling Updates)',
          'Gestión de Secretos y Variables de Entorno en Producción',
        ],
      },
      {
        semester: 3,
        title: 'Módulo 3 · Orquestación con Kubernetes e Infraestructura Cloud',
        subjects: [
          'Arquitectura de Kubernetes: Pods, Deployments, Services e Ingress',
          'Escalado Automático (HPA), ConfigMaps y Persistent Volumes',
          'Infraestructura como Código (IaC) con Terraform',
          'Servicios Cloud (Cómputo, Almacenamiento S3, Redes VPC y Balanceadores)',
        ],
      },
      {
        semester: 4,
        title: 'Módulo 4 · Observabilidad, SRE y Alta Disponibilidad',
        subjects: [
          'Monitoreo de Métricas con Prometheus y Tableros en Grafana',
          'Centralización de Logs y Trazabilidad Distribuida',
          'Ingeniería de Confiabilidad de Sitios (SLIs, SLOs y SLAs)',
          'Proyecto Final: Clúster Cloud Automatizado con CI/CD',
        ],
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    slug: 'bases-de-datos-sql-postgresql-ingenieria-datos',
    code: 'SIS-DBA-105',
    title: 'Bases de Datos SQL, PostgreSQL, Supabase e Ingeniería de Datos',
    type: 'curso',
    modality: '100% Online · Campus Virtual Moodle',
    duration: '60 Horas · 4 Módulos',
    summary:
      'Diseña, optimiza y administra bases de datos relacionales y NoSQL, consultas SQL avanzadas, seguridad RLS y pipelines ETL.',
    description:
      'Curso enfocado en el modelado de datos empresariales, administración de PostgreSQL, políticas de seguridad a nivel de fila (Row Level Security), indexación de alto rendimiento y arquitecturas de datos.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Módulo 1 · Modelado Relacional y SQL Fundamental',
        subjects: [
          'Diseño de Diagramas Entidad-Relación (DER) y Normalización (1FN a 3FN)',
          'Lenguaje DDL, DML y Restricciones de Integridad Referencial',
          'Consultas Avanzadas con JOINs, Subconsultas y Agregaciones',
          'Vistas, Funciones y Procedimientos Almacenados en PL/pgSQL',
        ],
      },
      {
        semester: 2,
        title: 'Módulo 2 · Administración Avanzada de PostgreSQL y Supabase',
        subjects: [
          'Transacciones ACID, Control de Concurrencia (MVCC) y Bloqueos',
          'Triggers, Auditoría Automática y Eventos en Tiempo Real',
          'Seguridad a Nivel de Fila (Row Level Security - RLS) y Roles',
          'Respaldo, Restauración (PITR) y Replicación de Bases de Datos',
        ],
      },
      {
        semester: 3,
        title: 'Módulo 3 · Optimización de Consultas y Bases NoSQL',
        subjects: [
          'Análisis de Planes de Ejecución con EXPLAIN ANALYZE',
          'Estrategias de Indexación (B-Tree, GIN, GiST y Particionamiento)',
          'Manejo de Datos Semi-Estructurados JSONB en PostgreSQL',
          'Introducción a Bases Documentales y Caché en Memoria con Redis',
        ],
      },
      {
        semester: 4,
        title: 'Módulo 4 · Pipelines ETL, Data Warehousing y Analítica',
        subjects: [
          'Extracción, Transformación y Carga de Datos (ETL / ELT)',
          'Modelado Dimensional (Esquema Estrella y Copo de Nieve)',
          'Consultas Analíticas con Window Functions y CTEs Recursivos',
          'Proyecto Final: Arquitectura de Datos Segura y Escalable',
        ],
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    slug: 'redes-empresariales-servidores-linux-infraestructura',
    code: 'SIS-NET-106',
    title: 'Redes Empresariales, Servidores Linux y Administración de Sistemas',
    type: 'curso',
    modality: '100% Online · Campus Virtual Moodle',
    duration: '60 Horas · 4 Módulos',
    summary:
      'Configura redes TCP/IP, enrutamiento, VLANs, servidores Linux, servicios DNS/DHCP/Web y virtualización de centros de datos.',
    description:
      'Formación integral para administradores de sistemas (SysAdmin) e ingenieros de soporte TI en diseño de redes corporativas, administración de servidores Linux y continuidad operativa.',
    is_active: true,
    semesters: [
      {
        semester: 1,
        title: 'Módulo 1 · Arquitectura de Redes TCP/IP y Subnetting',
        subjects: [
          'Modelo OSI y Pila de Protocolos TCP/IP',
          'Direccionamiento IPv4 / IPv6, CIDR y Cálculo de Subredes (VLSM)',
          'Conmutación Ethernet, Configuración de VLANs y Protocolo Spanning Tree',
          'Enrutamiento Estático y Dinámico (OSPF) en Entornos Empresariales',
        ],
      },
      {
        semester: 2,
        title: 'Módulo 2 · Administración de Servidores Linux (SysAdmin)',
        subjects: [
          'Instalación, Sistema de Archivos, Permisos POSIX y LVM en Linux',
          'Gestión de Usuarios, Grupos, Procesos y Servicios con Systemd',
          'Acceso Remoto Seguro por SSH, Llaves Criptográficas y Bastion Hosts',
          'Automatización de Tareas Programadas con Cron y Scripts Bash',
        ],
      },
      {
        semester: 3,
        title: 'Módulo 3 · Servicios de Red e Infraestructura Web',
        subjects: [
          'Configuración de Servidores DNS, DHCP y NTP',
          'Servidores Web Nginx y Apache: Reverse Proxy, Balanceo y SSL/TLS',
          'Servicios de Directorio (LDAP) y Compartición de Archivos en Red',
          'Virtualización de Servidores e Hipervisores (KVM / Proxmox)',
        ],
      },
      {
        semester: 4,
        title: 'Módulo 4 · Monitoreo de Red, Diagnóstico y Alta Disponibilidad',
        subjects: [
          'Diagnóstico y Resolución de Problemas de Red (Troubleshooting)',
          'Monitoreo de Infraestructura con SNMP, Zabbix y Alertamiento',
          'Redundancia de Enlaces, Balanceo de Carga y Respaldos Automatizados',
          'Proyecto Final: Diseño e Implementación de Red y Servidores Corporativos',
        ],
      },
    ],
  },
];

  // Los Dos Cursos de Ejemplo Obligatorios en Moodle (Sección 8.1, CA-08)
  private courseMappings: CourseMappingRecord[] = [
    {
      id: '22222222-2222-4222-8222-222222222201',
      program_id: '11111111-1111-4111-8111-111111111101',
      course_code: 'TI-101',
      course_name: 'Curso 1. Introducción a las Tecnologías de la Información',
      moodle_course_id: 101,
      moodle_shortname: 'IINICIA-TI-101',
      moodle_category_id: 1,
      description:
        'Fundamentos de sistemas computacionales, redes, bases de datos, seguridad de la información y servicios en la nube.',
      is_active: true,
      minimum_content_checklist: [
        'Profesor de prueba asignado (Roberto Méndez - Teacher)',
        'Al menos dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López)',
        'Presentación del curso y encuadre académico',
        'Recurso PDF / Página: Manual de Fundamentos de TI',
        'Foro de debate: Impacto de las TI en las organizaciones',
        'Tarea evaluable: Diagnóstico de arquitectura empresarial',
        'Cuestionario automatizado de Unidad 1',
        'Configuración de Calificación y Finalización de actividad',
      ],
      syllabus: [
        {
          unit: 'Unidad 1',
          title: 'Presentación y Fundamentos de Sistemas de Información',
          activities: [
            'Página: Presentación del curso y criterios de evaluación',
            'Recurso PDF: Arquitectura de Computadoras y Sistemas Operativos',
            'Foro: Bienvenida y análisis de casos de TI',
          ],
        },
        {
          unit: 'Unidad 2',
          title: 'Redes, Bases de Datos y Ciberseguridad',
          activities: [
            'Tarea: Diseño de red y modelo de datos básico',
            'Cuestionario: Evaluación de conceptos clave de TI (con calificación automática)',
            'Hito: Finalización de actividad verificada',
          ],
        },
      ],
    },
    {
      id: '22222222-2222-4222-8222-222222222202',
      program_id: '11111111-1111-4111-8111-111111111102',
      course_code: 'WEB-202',
      course_name: 'Curso 2. Desarrollo Web con React',
      moodle_course_id: 102,
      moodle_shortname: 'IINICIA-REACT-202',
      moodle_category_id: 1,
      description:
        'Construcción de aplicaciones web modernas con React, TypeScript, Next.js, consumo seguro de APIs REST y control de acceso por rol.',
      is_active: true,
      minimum_content_checklist: [
        'Profesor de prueba asignado (Roberto Méndez - Teacher)',
        'Al menos dos estudiantes matriculados (Ana Sofía García y Carlos Eduardo López)',
        'Unidades temáticas estructuradas (JSX, Estado, Hooks, Next.js App Router)',
        'Recurso técnico: Guía de Arquitectura React + TypeScript',
        'Actividad práctica entregable: Panel con RBAC y consumo de API',
        'Foro técnico de arquitectura frontend',
        'Cuestionario / Evaluación final con calificación',
        'Criterio de Finalización de curso habilitado',
      ],
      syllabus: [
        {
          unit: 'Tema 1',
          title: 'Componentes, Props, Estado y TypeScript en React',
          activities: [
            'Recurso: Guía oficial de patrones con React y TypeScript',
            'Foro técnico: Mejores prácticas de composición de componentes',
          ],
        },
        {
          unit: 'Tema 2',
          title: 'Next.js App Router, Seguridad y Consumo de APIs',
          activities: [
            'Actividad práctica: Implementación de panel protegido por rol',
            'Cuestionario de evaluación final de React y Next.js',
            'Hito: Finalización de curso con emisión de calificación en Moodle',
          ],
        },
      ],
    },
  ];

  // Relación user_programs
  private userPrograms: UserProgramRecord[] = [
    {
      id: 'up-001',
      user_id: '00000000-0000-4000-8000-000000000003',
      program_id: '11111111-1111-4111-8111-111111111101',
      academic_status: 'cursando',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      enrolled_at: '2026-10-05T12:00:00Z',
    },
    {
      id: 'up-002',
      user_id: '00000000-0000-4000-8000-000000000004',
      program_id: '11111111-1111-4111-8111-111111111102',
      academic_status: 'cursando',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      enrolled_at: '2026-10-06T12:00:00Z',
    },
  ];

  // Matrículas y autorizaciones en cursos de Moodle (CA-09, CA-12, CA-13)
  // Profesor asignado a Curso 1 y Curso 2 (editingteacher)
  // Estudiante 1 matriculada en Curso 1 y Curso 2
  // Estudiante 2 matriculado en Curso 1 y Curso 2
  private enrollments: EnrollmentRequestRecord[] = [
    {
      id: 'enr-negro-101',
      user_id: '00000000-0000-4000-8000-000000000007',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'editingteacher',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000006',
      authorized_at: '2026-10-15T12:00:00Z',
      moodle_synced_at: '2026-10-15T12:01:00Z',
      notes: 'Titular docente de Curso 1 (TI-101)',
      created_at: '2026-10-15T11:55:00Z',
    },
    {
      id: 'enr-negro-102',
      user_id: '00000000-0000-4000-8000-000000000007',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'editingteacher',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000006',
      authorized_at: '2026-10-15T12:02:00Z',
      moodle_synced_at: '2026-10-15T12:03:00Z',
      notes: 'Titular docente de Curso 2 (WEB-202)',
      created_at: '2026-10-15T11:58:00Z',
    },
    {
      id: 'enr-prof-101',
      user_id: '00000000-0000-4000-8000-000000000002',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'editingteacher',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-15T12:00:00Z',
      moodle_synced_at: '2026-10-15T12:01:00Z',
      notes: 'Titular docente de Curso 1 (TI-101)',
      created_at: '2026-10-15T11:55:00Z',
    },
    {
      id: 'enr-prof-102',
      user_id: '00000000-0000-4000-8000-000000000002',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'editingteacher',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-15T12:02:00Z',
      moodle_synced_at: '2026-10-15T12:03:00Z',
      notes: 'Titular docente de Curso 2 (WEB-202)',
      created_at: '2026-10-15T11:58:00Z',
    },
    {
      id: 'enr-est1-101',
      user_id: '00000000-0000-4000-8000-000000000003',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T14:30:00Z',
      moodle_synced_at: '2026-10-16T14:31:00Z',
      notes: 'Matrícula ordinaria Estudiante 1 en Curso 1',
      created_at: '2026-10-16T14:00:00Z',
    },
    {
      id: 'enr-est1-102',
      user_id: '00000000-0000-4000-8000-000000000003',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T14:32:00Z',
      moodle_synced_at: '2026-10-16T14:33:00Z',
      notes: 'Matrícula ordinaria Estudiante 1 en Curso 2',
      created_at: '2026-10-16T14:05:00Z',
    },
    {
      id: 'enr-est2-101',
      user_id: '00000000-0000-4000-8000-000000000004',
      course_mapping_id: '22222222-2222-4222-8222-222222222201',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T15:00:00Z',
      moodle_synced_at: '2026-10-16T15:01:00Z',
      notes: 'Matrícula ordinaria Estudiante 2 en Curso 1',
      created_at: '2026-10-16T14:50:00Z',
    },
    {
      id: 'enr-est2-102',
      user_id: '00000000-0000-4000-8000-000000000004',
      course_mapping_id: '22222222-2222-4222-8222-222222222202',
      moodle_role: 'student',
      status: 'sincronizada',
      authorized_by: '00000000-0000-4000-8000-000000000001',
      authorized_at: '2026-10-16T15:02:00Z',
      moodle_synced_at: '2026-10-16T15:03:00Z',
      notes: 'Matrícula ordinaria Estudiante 2 en Curso 2',
      created_at: '2026-10-16T14:55:00Z',
    },
  ];

  // Bitácora de auditoría (Sección 5.2, CA-19)
  private auditLogs: AuditLogRecord[] = [
    {
      id: 'audit-001',
      actor_id: '00000000-0000-4000-8000-000000000001',
      actor_email: 'admin@iinicia.edu.mx',
      target_user_id: '00000000-0000-4000-8000-000000000002',
      target_user_email: 'profesor@iinicia.edu.mx',
      action: 'MOODLE_TEACHER_SYNCED',
      entity_type: 'enrollment_requests',
      entity_id: 'enr-prof-101',
      details: {
        moodle_user_id: 2001,
        courses: ['IINICIA-TI-101', 'IINICIA-REACT-202'],
        moodle_role: 'editingteacher',
      },
      created_at: '2026-10-15T12:03:00Z',
    },
    {
      id: 'audit-002',
      actor_id: '00000000-0000-4000-8000-000000000001',
      actor_email: 'admin@iinicia.edu.mx',
      target_user_id: '00000000-0000-4000-8000-000000000003',
      target_user_email: 'estudiante1@iinicia.edu.mx',
      action: 'MOODLE_STUDENT_ENROLLED',
      entity_type: 'enrollment_requests',
      entity_id: 'enr-est1-101',
      details: {
        moodle_user_id: 3001,
        courses: ['IINICIA-TI-101', 'IINICIA-REACT-202'],
        moodle_role: 'student',
      },
      created_at: '2026-10-16T14:33:00Z',
    },
  ];

  private courseGrades: Array<{
    moodleCourseId: number;
    moodleUserId: number;
    userId: string;
    name: string;
    email: string;
    taskGrade: number;
    quizGrade: number;
    progress: number;
    feedback: string;
    gradedByEmail: string;
    updatedAt: string;
  }> = [
    {
      moodleCourseId: 101,
      moodleUserId: 3001,
      userId: '00000000-0000-4000-8000-000000000003',
      name: 'Ana Sofía García',
      email: 'estudiante1@iinicia.edu.mx',
      taskGrade: 96,
      quizGrade: 95,
      progress: 100,
      feedback: 'Excelente dominio de arquitectura de TI y segmentación de red.',
      gradedByEmail: 'profesor@iinicia.edu.mx',
      updatedAt: '2026-10-16T18:00:00Z',
    },
    {
      moodleCourseId: 101,
      moodleUserId: 3002,
      userId: '00000000-0000-4000-8000-000000000004',
      name: 'Carlos Eduardo López',
      email: 'estudiante2@iinicia.edu.mx',
      taskGrade: 92,
      quizGrade: 94,
      progress: 90,
      feedback: 'Muy buen diagnóstico de infraestructura y participación en foro.',
      gradedByEmail: 'profesor@iinicia.edu.mx',
      updatedAt: '2026-10-16T18:10:00Z',
    },
    {
      moodleCourseId: 102,
      moodleUserId: 3001,
      userId: '00000000-0000-4000-8000-000000000003',
      name: 'Ana Sofía García',
      email: 'estudiante1@iinicia.edu.mx',
      taskGrade: 98,
      quizGrade: 96,
      progress: 100,
      feedback: 'Implementación sobresaliente de componentes React + TypeScript y RBAC.',
      gradedByEmail: 'profesor@iinicia.edu.mx',
      updatedAt: '2026-10-17T18:00:00Z',
    },
    {
      moodleCourseId: 102,
      moodleUserId: 3002,
      userId: '00000000-0000-4000-8000-000000000004',
      name: 'Carlos Eduardo López',
      email: 'estudiante2@iinicia.edu.mx',
      taskGrade: 93,
      quizGrade: 95,
      progress: 95,
      feedback: 'Buen manejo de hooks y consumo seguro de API NestJS.',
      gradedByEmail: 'profesor@iinicia.edu.mx',
      updatedAt: '2026-10-17T18:15:00Z',
    },
  ];

  constructor(private readonly moodleService: MoodleService) {
    const supabaseUrl =
      process.env.SUPABASE_URL || 'https://pzlbxavsagibkbbqtlgd.supabase.co';
    const supabaseServiceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      'sb_publishable_JntNFNWjUVcNTnpKgCfzSA_LmyeYGn9';
    if (supabaseUrl && supabaseServiceKey) {
      this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false },
      });
    }
    this.loadPersistedState();
  }

  private loadPersistedState() {
    // Cargar estado directamente desde Supabase PostgreSQL
    this.loadFromSupabaseAsync();

    // Garantizar que ivan3172001@gmail.com siempre esté activo y con rol Administrador
    let ivanProfile = this.profiles.find(
      (p) => p.email.toLowerCase() === 'ivan3172001@gmail.com',
    );
    if (!ivanProfile) {
      ivanProfile = {
        id: '00000000-0000-4000-8000-000000000006',
        email: 'ivan3172001@gmail.com',
        first_name: 'Iván',
        last_name: '(Administrador)',
        phone: '+52 55 1000 0000',
        status: 'activo',
        moodle_user_id: 1001,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-01T09:00:00Z',
        created_at: '2026-10-01T08:00:00Z',
        updated_at: new Date().toISOString(),
      };
      this.profiles.unshift(ivanProfile);
    } else {
      ivanProfile.status = 'activo';
    }

    this.userRoles = this.userRoles.filter(
      (ur) => ur.user_id !== ivanProfile!.id,
    );
    this.userRoles.push({
      user_id: ivanProfile.id,
      role_code: 'admin',
      assigned_at: '2026-10-01T08:00:00Z',
    });

    // Garantizar que negromante.ba@gmail.com siempre esté activo, con rol Profesor y asignado a Curso 1 y Curso 2
    let profProfile = this.profiles.find(
      (p) => p.email.toLowerCase() === 'negromante.ba@gmail.com',
    );
    if (!profProfile) {
      profProfile = {
        id: '00000000-0000-4000-8000-000000000007',
        email: 'negromante.ba@gmail.com',
        first_name: 'Profesor',
        last_name: 'Titular (negromante.ba)',
        phone: '+52 55 1000 0007',
        status: 'activo',
        moodle_user_id: 2002,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-15T12:00:00Z',
        created_at: '2026-10-02T09:00:00Z',
        updated_at: new Date().toISOString(),
      };
      this.profiles.unshift(profProfile);
    } else {
      profProfile.status = 'activo';
      profProfile.moodle_user_id = profProfile.moodle_user_id || 2002;
      profProfile.moodle_sync_status = 'sincronizado';
    }

    this.userRoles = this.userRoles.filter(
      (ur) => ur.user_id !== profProfile!.id,
    );
    this.userRoles.push({
      user_id: profProfile.id,
      role_code: 'profesor',
      assigned_at: '2026-10-02T09:00:00Z',
    });

    for (const courseMappingId of [
      '22222222-2222-4222-8222-222222222201',
      '22222222-2222-4222-8222-222222222202',
    ]) {
      const hasEnr = this.enrollments.some(
        (e) =>
          e.user_id === profProfile!.id &&
          e.course_mapping_id === courseMappingId,
      );
      if (!hasEnr) {
        this.enrollments.push({
          id: `enr-negro-${courseMappingId.slice(-3)}`,
          user_id: profProfile.id,
          course_mapping_id: courseMappingId,
          moodle_role: 'editingteacher',
          status: 'sincronizada',
          authorized_by: ivanProfile.id,
          authorized_at: '2026-10-15T12:00:00Z',
          moodle_synced_at: '2026-10-15T12:01:00Z',
          notes: 'Titular docente en Campus Moodle',
          created_at: '2026-10-15T11:55:00Z',
        });
      }
    }

    // Garantizar que urielgonzalezvargas25@gmail.com siempre esté activo, con rol Estudiante y matriculado en Curso 1 y Curso 2
    let urielProfile = this.profiles.find(
      (p) => p.email.toLowerCase() === 'urielgonzalezvargas25@gmail.com',
    );
    if (!urielProfile) {
      urielProfile = {
        id: '00000000-0000-4000-8000-000000000008',
        email: 'urielgonzalezvargas25@gmail.com',
        first_name: 'Uriel',
        last_name: 'González Vargas',
        phone: '+52 55 1000 0008',
        status: 'activo',
        moodle_user_id: 3003,
        moodle_sync_status: 'sincronizado',
        moodle_last_sync_at: '2026-10-16T12:00:00Z',
        created_at: '2026-10-05T09:00:00Z',
        updated_at: new Date().toISOString(),
      };
      this.profiles.unshift(urielProfile);
    } else {
      urielProfile.status = 'activo';
      urielProfile.moodle_user_id = urielProfile.moodle_user_id || 3003;
      urielProfile.moodle_sync_status = 'sincronizado';
    }

    this.userRoles = this.userRoles.filter(
      (ur) => ur.user_id !== urielProfile!.id,
    );
    this.userRoles.push({
      user_id: urielProfile.id,
      role_code: 'estudiante',
      assigned_at: '2026-10-05T09:00:00Z',
    });

    const hasUrielProgram = this.userPrograms.some(
      (up) => up.user_id === urielProfile!.id,
    );
    if (!hasUrielProgram) {
      this.userPrograms.push({
        id: 'up-uriel-101',
        user_id: urielProfile.id,
        program_id: '11111111-1111-4111-8111-111111111101',
        academic_status: 'cursando',
        authorized_by: ivanProfile.id,
        enrolled_at: '2026-10-05T10:00:00Z',
      });
    }

    for (const courseMappingId of [
      '22222222-2222-4222-8222-222222222201',
      '22222222-2222-4222-8222-222222222202',
    ]) {
      const hasEnr = this.enrollments.some(
        (e) =>
          e.user_id === urielProfile!.id &&
          e.course_mapping_id === courseMappingId,
      );
      if (!hasEnr) {
        this.enrollments.push({
          id: `enr-uriel-${courseMappingId.slice(-3)}`,
          user_id: urielProfile.id,
          course_mapping_id: courseMappingId,
          moodle_role: 'student',
          status: 'sincronizada',
          authorized_by: ivanProfile.id,
          authorized_at: '2026-10-16T12:00:00Z',
          moodle_synced_at: '2026-10-16T12:01:00Z',
          notes: 'Matrícula Estudiante en Campus Moodle',
          created_at: '2026-10-16T11:55:00Z',
        });
      }
    }

    for (const courseId of [101, 102]) {
      const hasGrade = this.courseGrades.some(
        (g) =>
          g.moodleCourseId === courseId &&
          g.email.toLowerCase() === 'urielgonzalezvargas25@gmail.com',
      );
      if (!hasGrade) {
        this.courseGrades.push({
          moodleCourseId: courseId,
          moodleUserId: 3003,
          userId: urielProfile.id,
          name: 'Uriel González Vargas',
          email: 'urielgonzalezvargas25@gmail.com',
          taskGrade: 95,
          quizGrade: 96,
          progress: 100,
          feedback:
            'Excelente desempeño en prácticas de sistemas y desarrollo web.',
          gradedByEmail: 'negromante.ba@gmail.com',
          updatedAt: '2026-10-17T12:00:00Z',
        });
      }
    }

    this.persistState();
  }

  private persistState() {
    this.syncToSupabaseAsync();
  }

  /**
   * Carga en vivo todas las tablas desde Supabase PostgreSQL (TeseBASe).
   */
  private async loadFromSupabaseAsync() {
    if (!this.supabase) return;
    try {
      const [
        profilesRes,
        rolesRes,
        programsRes,
        enrollmentsRes,
        gradesRes,
        logsRes,
      ] = await Promise.all([
        this.supabase.from('profiles').select('*'),
        this.supabase.from('user_roles').select('*'),
        this.supabase.from('user_programs').select('*'),
        this.supabase.from('enrollment_requests').select('*'),
        this.supabase.from('course_grades').select('*'),
        this.supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (profilesRes.data && profilesRes.data.length > 0) {
        this.profiles = profilesRes.data.map((p: any) => ({
          id: p.id,
          email: p.email,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone || '',
          status: p.status,
          moodle_user_id: p.moodle_user_id,
          moodle_sync_status: p.moodle_sync_status || 'sin_sincronizar',
          moodle_last_sync_at: p.moodle_last_sync_at,
          created_at: p.created_at,
          updated_at: p.updated_at || p.created_at,
        }));
      }

      if (rolesRes.data && rolesRes.data.length > 0) {
        this.userRoles = rolesRes.data.map((ur: any) => ({
          user_id: ur.user_id,
          role_code: ur.role_code,
          assigned_at: ur.assigned_at,
        }));
      }

      if (programsRes.data && programsRes.data.length > 0) {
        this.userPrograms = programsRes.data.map((up: any) => ({
          id: up.id,
          user_id: up.user_id,
          program_id: up.program_id,
          academic_status: up.academic_status,
          authorized_by: up.authorized_by,
          enrolled_at: up.enrolled_at,
        }));
      }

      if (enrollmentsRes.data && enrollmentsRes.data.length > 0) {
        this.enrollments = enrollmentsRes.data.map((e: any) => ({
          id: e.id,
          user_id: e.user_id,
          course_mapping_id: e.course_mapping_id,
          moodle_role: e.moodle_role,
          status: e.status,
          authorized_by: e.authorized_by,
          authorized_at: e.authorized_at,
          moodle_synced_at: e.moodle_synced_at,
          notes: e.notes || '',
          created_at: e.created_at,
        }));
      }

      if (gradesRes.data && gradesRes.data.length > 0) {
        this.courseGrades = gradesRes.data.map((g: any) => ({
          moodleCourseId: Number(g.moodle_course_id),
          moodleUserId: Number(g.moodle_user_id || 3001),
          userId: g.user_id || '',
          name: g.student_name,
          email: g.student_email,
          taskGrade: Number(g.task_grade),
          quizGrade: Number(g.quiz_grade),
          progress: Number(g.progress),
          feedback: g.feedback || '',
          gradedByEmail: g.graded_by_email || 'negromante.ba@gmail.com',
          updatedAt: g.updated_at,
        }));
      }

      if (logsRes.data && logsRes.data.length > 0) {
        this.auditLogs = logsRes.data.map((l: any) => ({
          id: l.id,
          actor_id: l.actor_id,
          actor_email: l.actor_email,
          target_user_id: l.target_user_id,
          target_user_email: l.target_user_email,
          action: l.action,
          entity_type: l.entity_type,
          entity_id: l.entity_id,
          details: l.details || {},
          created_at: l.created_at,
        }));
      }
    } catch {
      // Si alguna tabla aún no está accesible, continúa con memoria y sincroniza
    }
  }

  /**
   * Sincronización directa hacia las tablas de Supabase PostgreSQL (sin archivos locales).
   */
  private syncToSupabaseAsync() {
    if (!this.supabase) return;

    this.supabase
      .from('profiles')
      .upsert(
        this.profiles.map((p) => ({
          id: p.id,
          email: p.email,
          first_name: p.first_name,
          last_name: p.last_name,
          phone: p.phone || '',
          status: p.status,
          moodle_user_id: p.moodle_user_id,
          moodle_sync_status: p.moodle_sync_status,
          moodle_last_sync_at: p.moodle_last_sync_at,
        })),
        { onConflict: 'email' },
      )
      .then(() => {}, () => {});

    this.supabase
      .from('user_roles')
      .upsert(
        this.userRoles.map((ur) => ({
          user_id: ur.user_id,
          role_code: ur.role_code,
          assigned_at: ur.assigned_at,
        })),
        { onConflict: 'user_id,role_code' },
      )
      .then(() => {}, () => {});

    this.supabase
      .from('enrollment_requests')
      .upsert(
        this.enrollments.map((e) => ({
          user_id: e.user_id,
          course_mapping_id: e.course_mapping_id,
          moodle_role: e.moodle_role,
          status: e.status,
          authorized_by: e.authorized_by,
          authorized_at: e.authorized_at,
          moodle_synced_at: e.moodle_synced_at,
          notes: e.notes || '',
        })),
        { onConflict: 'user_id,course_mapping_id' },
      )
      .then(() => {}, () => {});

    this.supabase
      .from('course_grades')
      .upsert(
        this.courseGrades.map((g) => ({
          moodle_course_id: g.moodleCourseId,
          student_email: g.email,
          student_name: g.name,
          moodle_user_id: g.moodleUserId,
          task_grade: g.taskGrade,
          quiz_grade: g.quizGrade,
          progress: g.progress,
          feedback: g.feedback,
          graded_by_email: g.gradedByEmail,
        })),
        { onConflict: 'moodle_course_id,student_email' },
      )
      .then(() => {}, () => {});
  }

  isSupabaseLive(): boolean {
    return this.supabase !== null;
  }

  // ---------------------------------------------------------------------------
  // CONSULTAS PÚBLICAS (Catálogo institucional)
  // ---------------------------------------------------------------------------
  getPublicPrograms(): ProgramRecord[] {
    return this.programs.filter((p) => p.is_active);
  }

  getProgramBySlug(slug: string) {
    const program = this.programs.find((p) => p.slug === slug && p.is_active);
    if (!program) {
      throw new NotFoundException(`Programa académico '${slug}' no encontrado`);
    }
    const relatedCourses = this.courseMappings
      .filter((c) => c.program_id === program.id && c.is_active)
      .map((c) => ({
        course_code: c.course_code,
        course_name: c.course_name,
        description: c.description,
      }));
    return {
      ...program,
      courses: relatedCourses,
    };
  }

  getRolesCatalog(): RoleRecord[] {
    return this.roles;
  }

  // ---------------------------------------------------------------------------
  // AUTENTICACIÓN, REGISTRO Y RESOLUCIÓN DE IDENTIDAD (Sección 5 y Flujo 7.1)
  // ---------------------------------------------------------------------------
  getUserRoles(userId: string): RoleCode[] {
    const codes = this.userRoles
      .filter((ur) => ur.user_id === userId)
      .map((ur) => ur.role_code);
    return codes.length > 0 ? codes : ['aspirante'];
  }

  getPrimaryRole(roles: RoleCode[]): RoleCode {
    const priority: RoleCode[] = [
      'superadmin',
      'admin',
      'coordinador',
      'profesor',
      'estudiante',
      'soporte',
      'aspirante',
    ];
    for (const r of priority) {
      if (roles.includes(r)) return r;
    }
    return 'aspirante';
  }

  resolveUserContextByIdOrEmail(identifier: string): AuthenticatedUserContext | null {
    const normalized = identifier.trim().toLowerCase();
    const profile = this.profiles.find(
      (p) => p.id.toLowerCase() === normalized || p.email.toLowerCase() === normalized,
    );
    if (!profile) return null;
    const roles = this.getUserRoles(profile.id);
    return {
      profile,
      roles,
      primaryRole: this.getPrimaryRole(roles),
    };
  }

  /**
   * Flujo 7.1: Registro y alta de usuario
   * 1. Usuario accede a /registro y captura sus datos.
   * 2. Supabase Auth genera identidad (sin guardar contraseñas en tablas propias, CA-04).
   * 3. Se crea el perfil en profiles.
   * 4. Se asigna rol inicial 'aspirante' y se audita el evento (CA-19).
   */
  async registerNewUser(input: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    interested_program_id?: string;
  }): Promise<AuthenticatedUserContext> {
    const email = input.email.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      throw new BadRequestException('El correo electrónico proporcionado no es válido.');
    }

    const existing = this.profiles.find((p) => p.email.toLowerCase() === email);
    if (existing) {
      throw new BadRequestException(
        `Ya existe un usuario registrado con el correo ${email}.`,
      );
    }

    const now = new Date().toISOString();
    const newId = crypto.randomUUID();
    const newProfile: ProfileRecord = {
      id: newId,
      email,
      first_name: input.first_name.trim(),
      last_name: input.last_name.trim(),
      phone: input.phone?.trim() || '',
      status: 'pendiente',
      moodle_user_id: null,
      moodle_sync_status: 'sin_sincronizar',
      moodle_last_sync_at: null,
      created_at: now,
      updated_at: now,
    };

    this.profiles.unshift(newProfile);
    this.userRoles.push({
      user_id: newId,
      role_code: 'aspirante',
      assigned_at: now,
    });

    if (input.interested_program_id) {
      const prog = this.programs.find((p) => p.id === input.interested_program_id);
      if (prog) {
        this.userPrograms.push({
          id: `up-${crypto.randomUUID().slice(0, 8)}`,
          user_id: newId,
          program_id: prog.id,
          academic_status: 'aspirante',
          enrolled_at: now,
        });
      }
    }

    this.recordAudit({
      actor_id: newId,
      target_user_id: newId,
      action: 'USER_REGISTERED',
      entity_type: 'profiles',
      entity_id: newId,
      details: {
        email,
        initial_role: 'aspirante',
        initial_status: 'pendiente',
        password_stored_in_custom_table: false,
      },
    });

    return {
      profile: newProfile,
      roles: ['aspirante'],
      primaryRole: 'aspirante',
    };
  }

  // ---------------------------------------------------------------------------
  // PANEL MI IINICIA Y ACCESO ESTRICTO POR ROL (Secciones 6, 7, 9.2, CA-06, CA-11, CA-12, CA-13)
  // ---------------------------------------------------------------------------
  getPersonalizedDashboard(ctx: AuthenticatedUserContext) {
    const { profile, roles, primaryRole } = ctx;

    // Programas asociados a este usuario
    const myPrograms = this.userPrograms
      .filter((up) => up.user_id === profile.id)
      .map((up) => {
        const program = this.programs.find((p) => p.id === up.program_id);
        return {
          ...up,
          program,
        };
      });

    // Cursos autorizados:
    // Requisito obligatorio (Sección 6 y 9.2):
    // Un usuario NO deberá visualizar cursos fuera de su rol y ámbito de autorización.
    const authorizedEnrollments = this.enrollments.filter(
      (enr) =>
        enr.user_id === profile.id &&
        (enr.status === 'autorizada' || enr.status === 'sincronizada'),
    );

    const authorizedCourses = authorizedEnrollments
      .map((enr) => {
        const course = this.courseMappings.find((c) => c.id === enr.course_mapping_id);
        if (!course) return null;

        // Validar coherencia de rol: Estudiante -> student, Profesor -> editingteacher
        if (primaryRole === 'estudiante' && enr.moodle_role !== 'student') {
          return null;
        }
        if (primaryRole === 'profesor' && enr.moodle_role !== 'editingteacher') {
          return null;
        }

        return {
          enrollment_id: enr.id,
          enrollment_status: enr.status,
          moodle_role: enr.moodle_role,
          moodle_role_label:
            enr.moodle_role === 'editingteacher' ? 'Profesor (Teacher)' : 'Estudiante (Student)',
          moodle_synced_at: enr.moodle_synced_at,
          course: {
            id: course.id,
            course_code: course.course_code,
            course_name: course.course_name,
            moodle_course_id: course.moodle_course_id,
            moodle_shortname: course.moodle_shortname,
            description: course.description,
            syllabus: course.syllabus,
            minimum_content_checklist: course.minimum_content_checklist,
          },
          role_capabilities_in_moodle:
            enr.moodle_role === 'editingteacher'
              ? [
                  'Configurar actividades, foros, tareas y cuestionarios',
                  'Calificar entregas y retroalimentar estudiantes',
                  'Consultar reporte de participación y finalización del grupo',
                ]
              : [
                  'Consultar materiales, páginas y recursos PDF',
                  'Participar en foros y entregar tareas/actividades prácticas',
                  'Responder cuestionarios y consultar calificaciones propias y progreso',
                ],
        };
      })
      .filter(Boolean);

    // Respuesta estrictamente adaptada al rol (Sección 9.2: no enviar datos no autorizados al cliente)
    const baseResponse = {
      profile,
      roles,
      primaryRole,
      programs: myPrograms,
      authorizedCourses,
      campusAccessEnabled:
        profile.status === 'activo' &&
        profile.moodle_user_id !== null &&
        authorizedCourses.length > 0 &&
        (roles.includes('estudiante') ||
          roles.includes('profesor') ||
          roles.includes('admin') ||
          roles.includes('superadmin') ||
          roles.includes('coordinador')),
    };

    if (primaryRole === 'aspirante') {
      return {
        ...baseResponse,
        authorizedCourses: [], // Aspirante nunca recibe cursos hasta ser autorizado (Sección 6)
        campusAccessEnabled: false,
        admissionTracker: {
          stage: profile.status === 'pendiente' ? 'En revisión por Admisiones' : 'Validado',
          nextSteps: [
            'Verificación de correo electrónico en Supabase Auth',
            'Revisión documental y autorización administrativa',
            'Asignación de rol Estudiante y matrícula en cursos autorizados',
          ],
        },
      };
    }

    if (primaryRole === 'admin' || primaryRole === 'superadmin') {
      return {
        ...baseResponse,
        adminSummary: {
          totalUsers: this.profiles.length,
          pendingUsers: this.profiles.filter((u) => u.status === 'pendiente').length,
          syncedWithMoodle: this.profiles.filter((u) => u.moodle_user_id !== null).length,
          totalActiveCourses: this.courseMappings.length,
          totalEnrollments: this.enrollments.length,
          moodleIntegration: this.moodleService.getIntegrationStatus(),
        },
      };
    }

    return baseResponse;
  }

  /**
   * Genera el enlace seguro SSO para acceder a un curso específico en el Campus Moodle (Sección 11).
   * Valida que el usuario esté activo, sincronizado con Moodle y tenga matrícula autorizada en ese curso.
   */
  generateCourseLaunchForUser(ctx: AuthenticatedUserContext, courseMappingId: string) {
    const { profile, roles } = ctx;

    if (profile.status !== 'activo') {
      throw new ForbiddenException(
        'Tu cuenta aún no está activa para ingresar al Campus Moodle.',
      );
    }

    if (roles.includes('aspirante') && !roles.includes('estudiante') && !roles.includes('profesor')) {
      throw new ForbiddenException(
        'El rol Aspirante no tiene acceso a cursos en Moodle hasta ser autorizado como Estudiante.',
      );
    }

    const enrollment = this.enrollments.find(
      (e) =>
        e.user_id === profile.id &&
        e.course_mapping_id === courseMappingId &&
        (e.status === 'autorizada' || e.status === 'sincronizada'),
    );

    if (!enrollment) {
      throw new ForbiddenException(
        'Acceso denegado: No cuentas con matrícula ni autorización vigente para este curso en Moodle (CA-12 / CA-13).',
      );
    }

    const course = this.courseMappings.find((c) => c.id === courseMappingId);
    if (!course) {
      throw new NotFoundException('Curso no encontrado.');
    }

    if (!profile.moodle_user_id) {
      throw new BadRequestException(
        'Tu perfil aún no tiene un moodle_user_id sincronizado. Solicita sincronización al administrador.',
      );
    }

    this.recordAudit({
      actor_id: profile.id,
      target_user_id: profile.id,
      action: 'CAMPUS_MOODLE_SSO_LAUNCH',
      entity_type: 'course_mappings',
      entity_id: course.id,
      details: {
        moodle_course_id: course.moodle_course_id,
        moodle_shortname: course.moodle_shortname,
        moodle_role: enrollment.moodle_role,
      },
    });

    return this.moodleService.generateCampusSsoLaunchUrl({
      userId: profile.id,
      moodleUserId: profile.moodle_user_id,
      moodleCourseId: course.moodle_course_id,
      moodleShortname: course.moodle_shortname,
      courseRole: enrollment.moodle_role,
    });
  }

  // ---------------------------------------------------------------------------
  // OPERACIONES ADMINISTRATIVAS Y SINCRONIZACIÓN CON MOODLE (Sección 10)
  // ---------------------------------------------------------------------------
  listUsersForAdmin(filters?: { search?: string; role?: string; status?: string }) {
    let list = this.profiles.map((profile) => {
      const roles = this.getUserRoles(profile.id);
      const userPrograms = this.userPrograms
        .filter((up) => up.user_id === profile.id)
        .map((up) => {
          const prog = this.programs.find((p) => p.id === up.program_id);
          return {
            id: up.id,
            program_id: up.program_id,
            program_title: prog?.title || '',
            program_code: prog?.code || '',
            academic_status: up.academic_status,
          };
        });

      const userEnrollments = this.enrollments
        .filter((e) => e.user_id === profile.id)
        .map((e) => {
          const course = this.courseMappings.find((c) => c.id === e.course_mapping_id);
          return {
            id: e.id,
            course_mapping_id: e.course_mapping_id,
            course_code: course?.course_code || '',
            course_name: course?.course_name || '',
            moodle_course_id: course?.moodle_course_id || null,
            moodle_role: e.moodle_role,
            status: e.status,
            moodle_synced_at: e.moodle_synced_at,
          };
        });

      return {
        ...profile,
        roles,
        primaryRole: this.getPrimaryRole(roles),
        programs: userPrograms,
        enrollments: userEnrollments,
      };
    });

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          u.first_name.toLowerCase().includes(q) ||
          u.last_name.toLowerCase().includes(q),
      );
    }

    if (filters?.role && filters.role !== 'todos') {
      list = list.filter((u) => u.roles.includes(filters.role as RoleCode));
    }

    if (filters?.status && filters.status !== 'todos') {
      list = list.filter((u) => u.status === filters.status);
    }

    return list;
  }

  getAllCoursesForAdmin() {
    return this.courseMappings.map((course) => {
      const enrolledCount = this.enrollments.filter(
        (e) => e.course_mapping_id === course.id && e.status === 'sincronizada',
      ).length;
      return {
        ...course,
        enrolledCount,
      };
    });
  }

  /**
   * Sección 10 y Flujos 7.1, 7.2, 7.3:
   * Cambia rol, estado y/o programa de un usuario, audita la operación y sincroniza con Moodle si procede.
   */
  async updateUserRoleAndStatus(
    actorCtx: AuthenticatedUserContext,
    targetUserId: string,
    payload: {
      role_code?: RoleCode;
      status?: UserStatus;
      program_id?: string;
      sync_moodle?: boolean;
    },
  ) {
    const profile = this.profiles.find((p) => p.id === targetUserId);
    if (!profile) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const previousRoles = this.getUserRoles(targetUserId);
    const previousStatus = profile.status;
    const now = new Date().toISOString();

    if (payload.role_code) {
      const validRole = this.roles.find((r) => r.code === payload.role_code);
      if (!validRole) {
        throw new BadRequestException(`Rol '${payload.role_code}' inválido.`);
      }
      this.userRoles = this.userRoles.filter((ur) => ur.user_id !== targetUserId);
      this.userRoles.push({
        user_id: targetUserId,
        role_code: payload.role_code,
        assigned_at: now,
      });
    }

    if (payload.status) {
      profile.status = payload.status;
      profile.updated_at = now;
    }

    if (payload.program_id) {
      const prog = this.programs.find((p) => p.id === payload.program_id);
      if (!prog) {
        throw new BadRequestException('Programa académico no encontrado.');
      }
      const existingProg = this.userPrograms.find(
        (up) => up.user_id === targetUserId && up.program_id === payload.program_id,
      );
      if (!existingProg) {
        this.userPrograms.push({
          id: `up-${crypto.randomUUID().slice(0, 8)}`,
          user_id: targetUserId,
          program_id: prog.id,
          academic_status: 'inscrito',
          authorized_by: actorCtx.profile.id,
          enrolled_at: now,
        });
      } else {
        existingProg.academic_status = 'inscrito';
      }
    }

    let moodleSyncResult: any = null;
    const updatedRoles = this.getUserRoles(targetUserId);
    const shouldSyncMoodle =
      payload.sync_moodle !== false &&
      profile.status === 'activo' &&
      (updatedRoles.includes('estudiante') || updatedRoles.includes('profesor'));

    if (shouldSyncMoodle) {
      moodleSyncResult = await this.syncUserWithMoodle(actorCtx, targetUserId);
    }

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: targetUserId,
      action: 'USER_ROLE_OR_STATUS_UPDATED',
      entity_type: 'profiles',
      entity_id: targetUserId,
      details: {
        previous_roles: previousRoles,
        new_roles: updatedRoles,
        previous_status: previousStatus,
        new_status: profile.status,
        program_id: payload.program_id || null,
        moodle_user_id: profile.moodle_user_id,
      },
    });

    return {
      user: this.listUsersForAdmin().find((u) => u.id === targetUserId),
      moodleSyncResult,
    };
  }

  /**
   * Sincroniza la identidad de un usuario con Moodle evitando duplicados (CA-10).
   */
  async syncUserWithMoodle(actorCtx: AuthenticatedUserContext, targetUserId: string) {
    const profile = this.profiles.find((p) => p.id === targetUserId);
    if (!profile) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const syncRes = await this.moodleService.findOrCreateMoodleUser(profile);
    profile.moodle_user_id = syncRes.moodleUserId;
    profile.moodle_sync_status = 'sincronizado';
    profile.moodle_last_sync_at = new Date().toISOString();
    profile.updated_at = profile.moodle_last_sync_at;

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: profile.id,
      action: 'MOODLE_USER_SYNCED',
      entity_type: 'profiles',
      entity_id: profile.id,
      details: {
        moodle_user_id: syncRes.moodleUserId,
        created_new_in_moodle: syncRes.createdNew,
        mode: syncRes.mode,
        message: syncRes.message,
      },
    });

    return syncRes;
  }

  /**
   * Autoriza y ejecuta la matrícula de un usuario (Estudiante o Profesor) en un curso de Moodle (Sección 8.2, 10, CA-12, CA-13).
   */
  async authorizeAndEnrolCourse(
    actorCtx: AuthenticatedUserContext,
    payload: {
      user_id: string;
      course_mapping_id: string;
      moodle_role?: 'student' | 'editingteacher';
      notes?: string;
    },
  ) {
    const profile = this.profiles.find((p) => p.id === payload.user_id);
    if (!profile) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const course = this.courseMappings.find((c) => c.id === payload.course_mapping_id);
    if (!course) {
      throw new NotFoundException('Curso de Moodle no encontrado en course_mappings.');
    }

    const userRoles = this.getUserRoles(profile.id);
    const resolvedMoodleRole: 'student' | 'editingteacher' =
      payload.moodle_role ||
      (userRoles.includes('profesor') ? 'editingteacher' : 'student');

    // Validar coherencia entre el rol en el portal y el rol en Moodle
    if (resolvedMoodleRole === 'editingteacher' && !userRoles.includes('profesor')) {
      throw new BadRequestException(
        'Solo un usuario con rol Profesor en el portal puede recibir el rol Teacher (editingteacher) en Moodle (CA-13).',
      );
    }

    if (
      resolvedMoodleRole === 'student' &&
      !userRoles.includes('estudiante') &&
      !userRoles.includes('profesor')
    ) {
      throw new BadRequestException(
        'El usuario debe tener rol Estudiante autorizado antes de ser matriculado en un curso de Moodle (CA-12).',
      );
    }

    // Asegurar que el usuario esté activo y vinculado en Moodle sin duplicados (CA-10)
    if (profile.status !== 'activo') {
      profile.status = 'activo';
    }
    if (!profile.moodle_user_id) {
      await this.syncUserWithMoodle(actorCtx, profile.id);
    }

    const moodleEnrolRes = await this.moodleService.enrolUserInCourse({
      moodleUserId: profile.moodle_user_id!,
      moodleCourseId: course.moodle_course_id,
      roleName: resolvedMoodleRole,
    });

    const now = new Date().toISOString();
    let enrollment = this.enrollments.find(
      (e) =>
        e.user_id === profile.id && e.course_mapping_id === course.id,
    );

    if (enrollment) {
      enrollment.moodle_role = resolvedMoodleRole;
      enrollment.status = 'sincronizada';
      enrollment.authorized_by = actorCtx.profile.id;
      enrollment.authorized_at = now;
      enrollment.moodle_synced_at = now;
      enrollment.notes = payload.notes || enrollment.notes;
    } else {
      enrollment = {
        id: `enr-${crypto.randomUUID().slice(0, 8)}`,
        user_id: profile.id,
        course_mapping_id: course.id,
        moodle_role: resolvedMoodleRole,
        status: 'sincronizada',
        authorized_by: actorCtx.profile.id,
        authorized_at: now,
        moodle_synced_at: now,
        notes: payload.notes || 'Autorizada y sincronizada desde Panel Administrativo',
        created_at: now,
      };
      this.enrollments.push(enrollment);
    }

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: profile.id,
      action:
        resolvedMoodleRole === 'editingteacher'
          ? 'MOODLE_TEACHER_ASSIGNED'
          : 'MOODLE_STUDENT_ENROLLED',
      entity_type: 'enrollment_requests',
      entity_id: enrollment.id,
      details: {
        course_code: course.course_code,
        course_name: course.course_name,
        moodle_course_id: course.moodle_course_id,
        moodle_user_id: profile.moodle_user_id,
        moodle_role: resolvedMoodleRole,
      },
    });

    return {
      enrollment,
      moodleEnrolResult: moodleEnrolRes,
    };
  }

  /**
   * Desmatricula a un usuario de un curso y actualiza su estado en enrollment_requests.
   */
  async revokeCourseEnrollment(actorCtx: AuthenticatedUserContext, enrollmentId: string) {
    const idx = this.enrollments.findIndex((e) => e.id === enrollmentId);
    if (idx === -1) {
      throw new NotFoundException('Matrícula no encontrada.');
    }

    const enrollment = this.enrollments[idx];
    const profile = this.profiles.find((p) => p.id === enrollment.user_id);
    const course = this.courseMappings.find((c) => c.id === enrollment.course_mapping_id);

    if (profile?.moodle_user_id && course) {
      await this.moodleService.unenrolUserFromCourse({
        moodleUserId: profile.moodle_user_id,
        moodleCourseId: course.moodle_course_id,
        roleName: enrollment.moodle_role,
      });
    }

    this.enrollments.splice(idx, 1);

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: enrollment.user_id,
      action: 'MOODLE_COURSE_UNENROLLED',
      entity_type: 'enrollment_requests',
      entity_id: enrollmentId,
      details: {
        course_code: course?.course_code,
        moodle_course_id: course?.moodle_course_id,
      },
    });

    return { revoked: true, enrollmentId };
  }

  getAuditLogs(limit = 50): AuditLogRecord[] {
    return this.auditLogs.slice(0, limit);
  }

  /**
   * Consulta las calificaciones del curso en el Campus Moodle según el rol:
   * - Profesor (editingteacher): ve y puede calificar a todos los estudiantes matriculados en ese curso.
   * - Estudiante (student): ve únicamente sus propias calificaciones (CA-06, CA-12).
   */
  getCourseGradesForUser(ctx: AuthenticatedUserContext, moodleCourseId: number) {
    const course = this.courseMappings.find(
      (c) => c.moodle_course_id === Number(moodleCourseId),
    );
    if (!course) {
      throw new NotFoundException('Curso de Moodle no encontrado.');
    }

    // Asegurar que todos los estudiantes matriculados en el curso aparezcan en el libro de calificaciones
    const studentEnrollments = this.enrollments.filter(
      (e) =>
        e.course_mapping_id === course.id &&
        e.moodle_role === 'student' &&
        (e.status === 'autorizada' || e.status === 'sincronizada'),
    );

    for (const enr of studentEnrollments) {
      const prof = this.profiles.find((p) => p.id === enr.user_id);
      if (!prof) continue;
      const exists = this.courseGrades.find(
        (g) =>
          g.moodleCourseId === Number(moodleCourseId) &&
          (g.userId === prof.id || g.email.toLowerCase() === prof.email.toLowerCase()),
      );
      if (!exists) {
        this.courseGrades.push({
          moodleCourseId: Number(moodleCourseId),
          moodleUserId: prof.moodle_user_id || 3050,
          userId: prof.id,
          name: `${prof.first_name} ${prof.last_name}`.trim(),
          email: prof.email,
          taskGrade: 0,
          quizGrade: 0,
          progress: 25,
          feedback: 'Pendiente de revisión por el profesor titular.',
          gradedByEmail: 'profesor@iinicia.edu.mx',
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const isTeacher = ctx.roles.includes('profesor');
    const allForCourse = this.courseGrades.filter(
      (g) => g.moodleCourseId === Number(moodleCourseId),
    );

    if (isTeacher || ctx.roles.includes('admin') || ctx.roles.includes('superadmin')) {
      return {
        canEditGrades: isTeacher,
        grades: allForCourse,
      };
    }

    return {
      canEditGrades: false,
      grades: allForCourse.filter(
        (g) =>
          g.userId === ctx.profile.id ||
          g.email.toLowerCase() === ctx.profile.email.toLowerCase(),
      ),
    };
  }

  /**
   * Permite exclusivamente a un Profesor (rol 'profesor' / editingteacher en Moodle)
   * calificar y retroalimentar a sus alumnos dentro del Aula Virtual Moodle (Sección 8 y CA-13).
   */
  updateStudentGradeByTeacher(
    actorCtx: AuthenticatedUserContext,
    payload: {
      moodleCourseId: number;
      studentEmail: string;
      taskGrade: number;
      quizGrade: number;
      progress: number;
      feedback: string;
    },
  ) {
    if (!actorCtx.roles.includes('profesor')) {
      throw new ForbiddenException(
        'Solo los usuarios con rol Profesor (Teacher en Moodle) pueden registrar o modificar calificaciones de alumnos (Sección 10 y CA-13).',
      );
    }

    const courseId = Number(payload.moodleCourseId);
    const emailNorm = payload.studentEmail.trim().toLowerCase();

    let record = this.courseGrades.find(
      (g) =>
        g.moodleCourseId === courseId && g.email.toLowerCase() === emailNorm,
    );

    const clamp = (n: number) =>
      Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    const now = new Date().toISOString();

    if (!record) {
      const studentProfile = this.profiles.find(
        (p) => p.email.toLowerCase() === emailNorm,
      );
      record = {
        moodleCourseId: courseId,
        moodleUserId: studentProfile?.moodle_user_id || 3050,
        userId: studentProfile?.id || `usr-${Date.now()}`,
        name: studentProfile
          ? `${studentProfile.first_name} ${studentProfile.last_name}`
          : emailNorm,
        email: emailNorm,
        taskGrade: clamp(payload.taskGrade),
        quizGrade: clamp(payload.quizGrade),
        progress: clamp(payload.progress),
        feedback: payload.feedback || '',
        gradedByEmail: actorCtx.profile.email,
        updatedAt: now,
      };
      this.courseGrades.push(record);
    } else {
      record.taskGrade = clamp(payload.taskGrade);
      record.quizGrade = clamp(payload.quizGrade);
      record.progress = clamp(payload.progress);
      record.feedback = payload.feedback ?? record.feedback;
      record.gradedByEmail = actorCtx.profile.email;
      record.updatedAt = now;
    }

    this.recordAudit({
      actor_id: actorCtx.profile.id,
      target_user_id: record.userId,
      action: 'MOODLE_TEACHER_GRADED_STUDENT',
      entity_type: 'moodle_gradebook',
      entity_id: `${courseId}:${record.email}`,
      details: {
        moodle_course_id: courseId,
        student_email: record.email,
        task_grade: record.taskGrade,
        quiz_grade: record.quizGrade,
        final_average: Math.round((record.taskGrade + record.quizGrade) / 2),
        progress: record.progress,
        feedback: record.feedback,
      },
    });

    return {
      updated: true,
      gradeRecord: record,
    };
  }

  private recordAudit(entry: {
    actor_id: string | null;
    target_user_id: string | null;
    action: string;
    entity_type: string;
    entity_id: string;
    details: Record<string, unknown>;
  }) {
    const actor = entry.actor_id
      ? this.profiles.find((p) => p.id === entry.actor_id)
      : undefined;
    const target = entry.target_user_id
      ? this.profiles.find((p) => p.id === entry.target_user_id)
      : undefined;

    const newLog = {
      id: crypto.randomUUID(),
      actor_id: entry.actor_id,
      actor_email: actor?.email || 'sistema@iinicia.edu.mx',
      target_user_id: entry.target_user_id,
      target_user_email: target?.email || undefined,
      action: entry.action,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id,
      details: entry.details,
      created_at: new Date().toISOString(),
    };

    this.auditLogs.unshift(newLog);

    if (this.supabase) {
      this.supabase
        .from('audit_logs')
        .insert({
          actor_email: newLog.actor_email,
          target_user_email: newLog.target_user_email || null,
          action: newLog.action,
          entity_type: newLog.entity_type,
          entity_id: newLog.entity_id,
          details: newLog.details,
        })
        .then(() => {}, () => {});
    }

    this.persistState();
  }
}
