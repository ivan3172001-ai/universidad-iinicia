/**
 * Capa de comunicación del Frontend (Next.js) con el Backend API (NestJS).
 * Cumple con la Regla de Integración (Sección 4, CA-14 y CA-15):
 * - El frontend NUNCA accede directamente a la base de datos de Moodle.
 * - No existen tokens administrativos de Moodle ni Service Role Keys de Supabase en el navegador.
 */

const LOCAL_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const isBrowserRemote =
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  const primaryBaseUrl = isBrowserRemote ? '/api/v1' : LOCAL_API_BASE_URL;

  let res: Response;
  try {
    res = await fetch(`${primaryBaseUrl}${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch {
    // Fallback automático a las rutas API integradas en Next.js (/api/v1)
    res = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
      cache: 'no-store',
    });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      data?.message || `Error ${res.status} al comunicarse con la API de IINICIA`,
    );
  }

  return data as T;
}

export interface ProgramSemester {
  semester: number;
  title: string;
  subjects: string[];
}

export interface ProgramItem {
  id: string;
  slug: string;
  code: string;
  title: string;
  type: string;
  modality: string;
  duration: string;
  summary: string;
  description: string;
  is_active: boolean;
  semesters: ProgramSemester[];
  courses: Array<{
    course_code: string;
    course_name: string;
    description: string;
  }>;
}

export const FALLBACK_PROGRAMS: ProgramItem[] = [
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
    courses: [
      {
        course_code: 'IINICIA-TI-101',
        course_name: 'Introducción a las Tecnologías de la Información',
        description:
          'Fundamentos de sistemas computacionales, redes, bases de datos y arquitectura de software.',
      },
      {
        course_code: 'IINICIA-REACT-202',
        course_name: 'Desarrollo Web Moderno con React y Next.js',
        description:
          'Construcción de aplicaciones web modernas con React, Next.js, TypeScript y consumo de APIs.',
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
    courses: [],
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
    courses: [],
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
    courses: [],
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
    courses: [],
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
    courses: [],
  },
];
