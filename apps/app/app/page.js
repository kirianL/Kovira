"use client";

import { useState, useEffect, useMemo } from "react";
import * as Lucide from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Notion/Linear style Icon loader using Lucide React
function Icon({ name, className = "", style = {}, size = 14 }) {
  const mapping = {
    dashboard: Lucide.LayoutDashboard,
    form: Lucide.FileText,
    inbox: Lucide.Inbox,
    flow: Lucide.GitBranch,
    "chart-pie": Lucide.BarChart3,
    cog: Lucide.Settings,
    "chevron-right": Lucide.ChevronRight,
    "new-window-page": Lucide.ExternalLink,
    bell: Lucide.Bell,
    plus: Lucide.Plus,
    trash: Lucide.Trash2,
    copy: Lucide.Copy,
    x: Lucide.X,
    "arrow-up": Lucide.ArrowUp,
    "arrow-down": Lucide.ArrowDown,
    menu: Lucide.Menu,
    "text-icon": Lucide.Type,
    "email-icon": Lucide.Mail,
    "number-icon": Lucide.Hash,
    "select-icon": Lucide.ChevronDownSquare,
    "checkbox-icon": Lucide.CheckSquare,
    "radio-icon": Lucide.CircleDot,
    "date-icon": Lucide.Calendar,
    "file-icon": Lucide.UploadCloud,
    "grip-vertical": Lucide.GripVertical,
    eye: Lucide.Eye,
    "arrow-left": Lucide.ArrowLeft,
    "arrow-right": Lucide.ArrowRight,
    check: Lucide.Check,
    "corner-down-left": Lucide.CornerDownLeft,
    "chevron-down": Lucide.ChevronDown,
    "alert-circle": Lucide.AlertCircle,
    "log-out": Lucide.LogOut
  };

  const LucideIcon = mapping[name] || Lucide.HelpCircle;
  return (
    <LucideIcon 
      className={className} 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: 'middle',
        strokeWidth: 1.5,
        width: `${size}px`,
        height: `${size}px`,
        ...style
      }}
    />
  );
}

function SortableField({
  field,
  idx,
  selectedFieldId,
  setSelectedFieldId,
  activeForm,
  duplicateField,
  deleteField,
  moveField
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 9999 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`canvas-field ${selectedFieldId === field.id ? "selected" : ""} ${isDragging ? "dragging" : ""}`}
      onClick={() => setSelectedFieldId(field.id)}
    >
      <div className="canvas-field-header-row">
        <div 
          className="canvas-field-drag" 
          style={{ cursor: "grab", display: "flex", alignItems: "center", touchAction: "none" }}
          {...attributes}
          {...listeners}
        >
          <Icon name="grip-vertical" size={14} style={{ color: "var(--color-fog)" }} />
        </div>
        
        <div className="canvas-field-title-wrap">
          <span className="canvas-field-type-tag">
            <Icon name={`${field.type}-icon`} size={10} style={{ marginRight: 4 }} />
            {field.type === "text" ? "Texto" : field.type === "select" ? "Desplegable" : field.type}
          </span>
          <span className="canvas-field-label" style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink)" }}>
            {field.label || `Campo ${field.type}`}
            {field.required && <span className="canvas-field-required">*</span>}
          </span>
        </div>

        <div className="canvas-field-actions">
          <button className="btn-field-action" title="Mover Arriba" onClick={(e) => { e.stopPropagation(); moveField(idx, -1); }} disabled={idx === 0}>
            <Icon name="arrow-up" size={12} />
          </button>
          <button className="btn-field-action" title="Mover Abajo" onClick={(e) => { e.stopPropagation(); moveField(idx, 1); }} disabled={idx === activeForm.fields.length - 1}>
            <Icon name="arrow-down" size={12} />
          </button>
          <button className="btn-field-action" title="Duplicar" onClick={(e) => { e.stopPropagation(); duplicateField(field); }}>
            <Icon name="copy" size={12} />
          </button>
          <button className="btn-field-action" title="Eliminar" style={{ color: "#ef4444" }} onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}>
            <Icon name="trash" size={12} />
          </button>
        </div>
      </div>

      <div className="canvas-field-mockup-wrapper">
        {field.type === "text" && (
          <div className="mock-input">
            {field.placeholder || "Texto de respuesta corta..."}
          </div>
        )}
        {field.type === "email" && (
          <div className="mock-input">
            <Icon name="email-icon" size={13} style={{ marginRight: 6, color: "var(--color-slate)" }} />
            {field.placeholder || "correo@ejemplo.com"}
          </div>
        )}
        {field.type === "number" && (
          <div className="mock-input">
            <Icon name="number-icon" size={13} style={{ marginRight: 6, color: "var(--color-slate)" }} />
            {field.placeholder || "Número..."}
          </div>
        )}
        {field.type === "date" && (
          <div className="mock-input">
            <Icon name="date-icon" size={13} style={{ marginRight: 6, color: "var(--color-slate)" }} />
            {field.placeholder || "dd/mm/aaaa"}
          </div>
        )}
        {field.type === "select" && (
          <div className="mock-select-dropdown">
            <span>{field.placeholder || "Selecciona una opción..."}</span>
            <Icon name="chevron-down" size={12} style={{ color: "var(--color-slate)" }} />
          </div>
        )}
        {field.type === "radio" && (
          <div className="mock-options-list">
            {(field.options && field.options.length > 0 ? field.options : ["Opción 1", "Opción 2"]).map((opt, oIdx) => (
              <div key={oIdx} className="mock-option-item">
                <div className="mock-radio-dot" />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        )}
        {field.type === "checkbox" && (
          <div className="mock-options-list">
            {(field.options && field.options.length > 0 ? field.options : ["Opción 1", "Opción 2"]).map((opt, oIdx) => (
              <div key={oIdx} className="mock-option-item">
                <div className="mock-checkbox-box" />
                <span>{opt}</span>
              </div>
            ))}
          </div>
        )}
        {field.type === "file" && (
          <div className="mock-file-upload-zone">
            <Icon name="file-icon" size={16} style={{ color: "var(--color-slate)" }} />
            <span>{field.placeholder || "Subir archivo (máx. 10MB)"}</span>
          </div>
        )}
      </div>

      {field.condition && field.condition.fieldId && (
        <div className="condition-badge" style={{ alignSelf: "flex-start" }}>
          <Icon name="flow" size={10} style={{ marginRight: 4 }} />
          <span>Mostrar si target es "{field.condition.equalsValue}"</span>
        </div>
      )}
    </div>
  );
}

function DraggableFieldChip({ item, addFieldToForm }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `new-${item.type}`,
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : undefined,
    cursor: "grab",
    touchAction: "none",
  } : {
    cursor: "grab",
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`field-chip ${isDragging ? "dragging" : ""}`}
      onClick={(e) => {
        if (!transform) {
          addFieldToForm(item.type);
        }
      }}
    >
      <Icon name={item.icon} size={13} style={{ color: "var(--color-slate)" }} />
      {item.label}
    </div>
  );
}

function DroppableCanvas({ children, id }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div 
      ref={setNodeRef} 
      className={`droppable-canvas ${isOver ? "canvas-drag-over" : ""}`}
    >
      {children}
    </div>
  );
}

const getFieldIcon = (type) => {
  const icons = {
    text: "text-icon",
    email: "email-icon",
    number: "number-icon",
    select: "select-icon",
    checkbox: "checkbox-icon",
    radio: "radio-icon",
    date: "date-icon",
    file: "file-icon"
  };
  return icons[type] || "text-icon";
};

const getFieldLabel = (type) => {
  const labels = {
    text: "Texto Corto",
    email: "Correo Electrónico",
    number: "Número",
    select: "Lista Desplegable",
    checkbox: "Opción Múltiple",
    radio: "Opción Única",
    date: "Selector Fecha",
    file: "Subir Archivo"
  };
  return labels[type] || type;
};

export default function SaaSApp() {
  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [session, setSession] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState("personal");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeDragId, setActiveDragId] = useState(null);
  const [mobileBuilderTab, setMobileBuilderTab] = useState("canvas");
  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);

  const handleSelectField = (fieldId) => {
    setSelectedFieldId(fieldId);
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobileBuilderTab("properties");
    }
  };

  // Workspace Database State
  const [forms, setForms] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [members, setMembers] = useState([]);
  
  // Settings & Configuration States
  const [workspaceName, setWorkspaceName] = useState("");
  const [rateLimit, setRateLimit] = useState(120);
  const [honeypotActive, setHoneypotActive] = useState(true);

  // Modal, Drawer & Editor Focus States
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState({});
  const [previewError, setPreviewError] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepError, setStepError] = useState(false);
  const [isSelectDropdownOpen, setIsSelectDropdownOpen] = useState(false);
  
  // Create / Input Form States
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState(null);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("viewer");
  const [newCommentText, setNewCommentText] = useState("");
  const [newTagName, setNewTagName] = useState("");

  // Search and Filter States for Submissions
  const [searchQuery, setSearchQuery] = useState("");
  const [filterFormId, setFilterFormId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterTag, setFilterTag] = useState("all");

  // Selected Workflow Focus
  const [selectedWorkflowId, setSelectedWorkflowId] = useState("");
  const [activeLogId, setActiveLogId] = useState(null);

  // Drag & Drop sensors configuration
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 4,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    setActiveDragId(event.active.id);
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveDragId(null);
    if (!active) return;
    if (!activeForm) return;

    // Caso 1: Arrastrar nuevo elemento desde la barra de herramientas
    if (typeof active.id === "string" && active.id.startsWith("new-")) {
      const fieldType = active.id.replace("new-", "");
      const newField = {
        id: `fld-${Date.now()}`,
        type: fieldType,
        label: `Nuevo campo ${fieldType === "text" ? "Texto" : fieldType === "select" ? "Desplegable" : fieldType}`,
        placeholder: fieldType === "select" || fieldType === "radio" ? "" : "Escribe aquí...",
        required: false,
        options: fieldType === "select" || fieldType === "radio" || fieldType === "checkbox" ? ["Opción A", "Opción B"] : undefined
      };

      let newFieldsList = [...activeForm.fields];
      if (over) {
        const targetIdx = activeForm.fields.findIndex(f => f.id === over.id);
        if (targetIdx !== -1) {
          newFieldsList.splice(targetIdx, 0, newField);
        } else {
          newFieldsList.push(newField);
        }
      } else {
        newFieldsList.push(newField);
      }

      const updatedForms = forms.map(f => {
        if (f.id === activeForm.id) {
          return { ...f, fields: newFieldsList };
        }
        return f;
      });
      setForms(updatedForms);
      saveToLocalStorage("forms", updatedForms);
      setSelectedFieldId(newField.id);
      return;
    }

    // Caso 2: Reordenar campos existentes
    if (over && active.id !== over.id) {
      const oldIndex = activeForm.fields.findIndex(f => f.id === active.id);
      const newIndex = activeForm.fields.findIndex(f => f.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const fieldsCopy = arrayMove(activeForm.fields, oldIndex, newIndex);
        const updatedForms = forms.map(f => {
          if (f.id === activeForm.id) {
            return { ...f, fields: fieldsCopy };
          }
          return f;
        });
        setForms(updatedForms);
        saveToLocalStorage("forms", updatedForms);
      }
    }
  };

  // 1. Initial mounting check to avoid hydration issues and verify session
  useEffect(() => {
    if (typeof window !== "undefined") {
      const sessionData = localStorage.getItem("better-auth.session");
      if (!sessionData) {
        window.location.href = "/?open_signin=true";
      } else {
        try {
          const parsed = JSON.parse(sessionData);
          setSession(parsed);
          setIsMounted(true);
        } catch (e) {
          window.location.href = "/?open_signin=true";
        }
      }
    }
  }, []);

  // Listen for Escape key to close mobile sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsMobileSidebarOpen(false);
      }
    };
    if (isMobileSidebarOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileSidebarOpen]);

  // 2. Load and seed data scoped by workspace from localStorage
  useEffect(() => {
    if (!isMounted) return;

    const formsKey = `kovira_ws_${activeWorkspace}_forms`;
    const subsKey = `kovira_ws_${activeWorkspace}_submissions`;
    const wfKey = `kovira_ws_${activeWorkspace}_workflows`;
    const execsKey = `kovira_ws_${activeWorkspace}_executions`;
    const keysKey = `kovira_ws_${activeWorkspace}_apikeys`;
    const memsKey = `kovira_ws_${activeWorkspace}_members`;
    const wsNameKey = `kovira_ws_${activeWorkspace}_name`;
    const rateKey = `kovira_ws_${activeWorkspace}_ratelimit`;
    const honeyKey = `kovira_ws_${activeWorkspace}_honeypot`;

    // Load Workspace name
    const storedName = localStorage.getItem(wsNameKey);
    setWorkspaceName(storedName || (activeWorkspace === "personal" ? "Personal Workspace" : "Acme Corp Workspace"));
    
    // Load Rate limits & security
    setRateLimit(Number(localStorage.getItem(rateKey)) || 120);
    setHoneypotActive(localStorage.getItem(honeyKey) !== "false");

    // Seed/Load forms
    const storedForms = localStorage.getItem(formsKey);
    if (storedForms) {
      const parsed = JSON.parse(storedForms);
      setForms(parsed);
      if (parsed.length > 0) setSelectedFormId(parsed[0].id);
    } else {
      const defaultForms = activeWorkspace === "personal" 
        ? [
            {
              id: "f-cx",
              name: "Encuesta CX — Soporte",
              created_at: "2026-06-20T10:00:00Z",
              views: 120,
              submissionsCount: 3,
              theme: "Indigo",
              thankYouText: "¡Muchas gracias por tu feedback! Tus comentarios nos impulsan a seguir mejorando.",
              redirectUrl: "",
              fields: [
                { id: "f-name", type: "text", label: "Nombre Completo", placeholder: "ej. Marvin López", required: true },
                { id: "f-email", type: "email", label: "Correo Electrónico", placeholder: "correo@ejemplo.com", required: true },
                { id: "f-rating", type: "select", label: "Calificación del servicio", required: true, options: ["Excelente", "Bueno", "Regular", "Malo"] },
                { id: "f-comments", type: "text", label: "¿Qué podemos mejorar?", placeholder: "Describe tu experiencia...", required: false, condition: { fieldId: "f-rating", equalsValue: "Malo" } }
              ]
            }
          ]
        : [
            {
              id: "f-event",
              name: "Registro Evento Anual 2026",
              created_at: "2026-06-18T08:30:00Z",
              views: 450,
              submissionsCount: 2,
              theme: "Sage",
              thankYouText: "¡Registro exitoso! En unos minutos recibirás tu pase VIP en tu email.",
              redirectUrl: "",
              fields: [
                { id: "ev-name", type: "text", label: "Nombre Completo", placeholder: "ej. Ana Solano", required: true },
                { id: "ev-email", type: "email", label: "Email corporativo", placeholder: "ana@acme.com", required: true },
                { id: "ev-company", type: "text", label: "Compañía", placeholder: "Sorin Labs", required: false },
                { id: "ev-ticket", type: "select", label: "Pase", required: true, options: ["General", "VIP", "Prensa"] }
              ]
            }
          ];
      setForms(defaultForms);
      localStorage.setItem(formsKey, JSON.stringify(defaultForms));
      if (defaultForms.length > 0) setSelectedFormId(defaultForms[0].id);
    }

    // Seed/Load submissions
    const storedSubs = localStorage.getItem(subsKey);
    if (storedSubs) {
      setSubmissions(JSON.parse(storedSubs));
    } else {
      const defaultSubs = activeWorkspace === "personal"
        ? [
            {
              id: "sub-101",
              formId: "f-cx",
              data: { "Nombre Completo": "Marvin López", "Correo Electrónico": "marvin@sorinlabs.com", "Calificación del servicio": "Excelente", "¿Qué podemos mejorar?": "" },
              status: "approved",
              tags: ["CX", "VIP"],
              created_at: "2026-06-21T09:45:00-06:00",
              comments: [{ id: "c-1", author: "Kirian Luna", text: "Cliente clave, excelente feedback.", created_at: "2026-06-21T10:00:00Z" }],
              activity: [
                { id: "act-1", action: "submitted", user: "System", details: "Formulario enviado por Marvin López", created_at: "2026-06-21T09:45:00Z" },
                { id: "act-2", action: "status_change", user: "Kirian Luna", details: "Estado cambiado de pending a approved", created_at: "2026-06-21T10:00:00Z" }
              ]
            },
            {
              id: "sub-102",
              formId: "f-cx",
              data: { "Nombre Completo": "Ana Solano", "Correo Electrónico": "ana.solano@example.com", "Calificación del servicio": "Bueno", "¿Qué podemos mejorar?": "" },
              status: "reviewed",
              tags: ["Feedback"],
              created_at: "2026-06-20T11:15:00-06:00",
              comments: [],
              activity: [{ id: "act-3", action: "submitted", user: "System", details: "Formulario enviado por Ana Solano", created_at: "2026-06-20T11:15:00Z" }]
            },
            {
              id: "sub-103",
              formId: "f-cx",
              data: { "Nombre Completo": "Carlos Rojas", "Correo Electrónico": "crojas@correo.com", "Calificación del servicio": "Malo", "¿Qué podemos mejorar?": "El portal de pagos falló en el primer intento." },
              status: "pending",
              tags: ["Incidencia"],
              created_at: "2026-06-19T14:20:00-06:00",
              comments: [],
              activity: [{ id: "act-4", action: "submitted", user: "System", details: "Formulario enviado por Carlos Rojas", created_at: "2026-06-19T14:20:00Z" }]
            }
          ]
        : [
            {
              id: "sub-201",
              formId: "f-event",
              data: { "Nombre Completo": "Diego Quirós", "Email de contacto": "luis@quiros.cr", "Compañía": "Aerolytic", "Pase": "VIP" },
              status: "approved",
              tags: ["VIP"],
              created_at: "2026-06-21T08:10:00-06:00",
              comments: [],
              activity: [{ id: "act-5", action: "submitted", user: "System", details: "Formulario enviado por Diego Quirós", created_at: "2026-06-21T08:10:00Z" }]
            },
            {
              id: "sub-202",
              formId: "f-event",
              data: { "Nombre Completo": "Lucía Montenegro", "Email de contacto": "lmontenegro@corp.com", "Compañía": "Monocloud", "Pase": "General" },
              status: "pending",
              tags: [],
              created_at: "2026-06-20T15:30:00-06:00",
              comments: [],
              activity: [{ id: "act-6", action: "submitted", user: "System", details: "Formulario enviado por Lucía Montenegro", created_at: "2026-06-20T15:30:00Z" }]
            }
          ];
      setSubmissions(defaultSubs);
      localStorage.setItem(subsKey, JSON.stringify(defaultSubs));
    }

    // Seed/Load workflows
    const storedWF = localStorage.getItem(wfKey);
    if (storedWF) {
      const parsed = JSON.parse(storedWF);
      setWorkflows(parsed);
      if (parsed.length > 0) setSelectedWorkflowId(parsed[0].id);
    } else {
      const defaultWFs = activeWorkspace === "personal"
        ? [
            {
              id: "wf-cx-auto",
              formId: "f-cx",
              name: "Auto-aprobación de CX Excelente",
              active: true,
              nodes: [
                { id: "w-trig", type: "trigger", label: "Formulario Enviado", details: "Encuesta CX — Soporte" },
                { id: "w-cond", type: "condition", label: "Si Calificación == Excelente", details: "Campo Calificación es Excelente" },
                { id: "w-act1", type: "action", label: "Aprobar Envío", details: "Estado cambiado a Approved" },
                { id: "w-act2", type: "action", label: "Enviar Webhook", details: "POST https://api.sorinlabs.com/kovira/cx" }
              ]
            }
          ]
        : [
            {
              id: "wf-event-vip",
              formId: "f-event",
              name: "Alerta de Registro VIP",
              active: true,
              nodes: [
                { id: "we-trig", type: "trigger", label: "Formulario Enviado", details: "Registro Evento Anual" },
                { id: "we-cond", type: "condition", label: "Si Pase == VIP", details: "Campo Pase es VIP" },
                { id: "we-act1", type: "action", label: "Enviar Email Interno", details: "Notificar a ventas@acme.com" }
              ]
            }
          ];
      setWorkflows(defaultWFs);
      localStorage.setItem(wfKey, JSON.stringify(defaultWFs));
      if (defaultWFs.length > 0) setSelectedWorkflowId(defaultWFs[0].id);
    }

    // Seed/Load workflow execution logs
    const storedExecs = localStorage.getItem(execsKey);
    if (storedExecs) {
      const parsed = JSON.parse(storedExecs);
      setExecutions(parsed);
      if (parsed.length > 0) setActiveLogId(parsed[0].id);
    } else {
      const defaultExecs = activeWorkspace === "personal"
        ? [
            {
              id: "ex-301",
              workflowId: "wf-cx-auto",
              submissionId: "sub-101",
              status: "success",
              created_at: "2026-06-21T09:45:02Z",
              logs: [
                "09:45:00 - Workflow ejecutado por Envío #sub-101",
                "09:45:01 - Condición evaluada: Calificación ('Excelente') == 'Excelente' => VERDADERO",
                "09:45:01 - Acción: Estado del envío actualizado a aprobado => SUCCESS",
                "09:45:02 - Acción: Llamada Webhook POST 'https://api.sorinlabs.com/kovira/cx' => Código 200 OK",
                "09:45:02 - Flujo finalizado con éxito."
              ]
            }
          ]
        : [
            {
              id: "ex-302",
              workflowId: "wf-event-vip",
              submissionId: "sub-201",
              status: "success",
              created_at: "2026-06-21T08:10:04Z",
              logs: [
                "08:10:00 - Workflow ejecutado por Envío #sub-201",
                "08:10:02 - Condición evaluada: Pase ('VIP') == 'VIP' => VERDADERO",
                "08:10:03 - Acción: Enviar email interno a ventas@acme.com => ENVIADO",
                "08:10:04 - Flujo finalizado con éxito."
              ]
            }
          ];
      setExecutions(defaultExecs);
      localStorage.setItem(execsKey, JSON.stringify(defaultExecs));
      if (defaultExecs.length > 0) setActiveLogId(defaultExecs[0].id);
    }

    // Seed/Load API Keys
    const storedKeys = localStorage.getItem(keysKey);
    if (storedKeys) {
      setApiKeys(JSON.parse(storedKeys));
    } else {
      const defaultKeys = [
        { id: "k-1", name: "Servidor de Producción", key: "kv_live_b51a4f0d3678c1aefb2267", created_at: "2026-06-19T10:00:00Z", status: "active" },
        { id: "k-2", name: "Sincronización Webhook", key: "kv_live_7c14a2bf19da30be8c1872", created_at: "2026-06-20T14:30:00Z", status: "active" }
      ];
      setApiKeys(defaultKeys);
      localStorage.setItem(keysKey, JSON.stringify(defaultKeys));
    }

    // Seed/Load members
    const storedMembers = localStorage.getItem(memsKey);
    if (storedMembers) {
      setMembers(JSON.parse(storedMembers));
    } else {
      const defaultMembers = [
        { id: "m-1", email: "kirian@sorinlabs.com", role: "owner", joined: true },
        { id: "m-2", email: "admin@sorinlabs.com", role: "admin", joined: true },
        { id: "m-3", email: "editor@sorinlabs.com", role: "editor", joined: true }
      ];
      setMembers(defaultMembers);
      localStorage.setItem(memsKey, JSON.stringify(defaultMembers));
    }
  }, [isMounted, activeWorkspace]);

  // Helper function to save current workspace lists to local storage
  const saveToLocalStorage = (keySuffix, data) => {
    localStorage.setItem(`kovira_ws_${activeWorkspace}_${keySuffix}`, JSON.stringify(data));
  };

  // State calculations
  const activeForm = useMemo(() => {
    return forms.find(f => f.id === selectedFormId) || forms[0] || null;
  }, [forms, selectedFormId]);

  const activeSubmission = useMemo(() => {
    return submissions.find(s => s.id === selectedSubmissionId) || null;
  }, [submissions, selectedSubmissionId]);

  const activeWorkflow = useMemo(() => {
    return workflows.find(w => w.id === selectedWorkflowId) || workflows[0] || null;
  }, [workflows, selectedWorkflowId]);

  // Filtered submissions list
  const filteredSubmissions = useMemo(() => {
    return submissions.filter(sub => {
      // Form filter
      if (filterFormId !== "all" && sub.formId !== filterFormId) return false;
      // Status filter
      if (filterStatus !== "all" && sub.status !== filterStatus) return false;
      // Tag filter
      if (filterTag !== "all" && !sub.tags.includes(filterTag)) return false;
      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesQuery = Object.values(sub.data).some(val => 
          String(val).toLowerCase().includes(query)
        ) || sub.id.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }
      return true;
    });
  }, [submissions, filterFormId, filterStatus, filterTag, searchQuery]);

  // Tags list compiled from all submissions
  const allAvailableTags = useMemo(() => {
    const tagsSet = new Set();
    submissions.forEach(sub => sub.tags.forEach(t => tagsSet.add(t)));
    return Array.from(tagsSet);
  }, [submissions]);

  // Form Views / Completion analytics values
  const totalViews = useMemo(() => forms.reduce((sum, f) => sum + f.views, 0), [forms]);
  const totalSubmissions = submissions.length;
  const overallConversion = totalViews > 0 ? Math.round((totalSubmissions / totalViews) * 100) : 0;

  // Recent activity feed items (submissions, status changes, comment events)
  const activityFeed = useMemo(() => {
    const items = [];
    submissions.forEach(sub => {
      const formName = forms.find(f => f.id === sub.formId)?.name || "Formulario";
      const submitter = sub.data["Nombre Completo"] || sub.data["Nombre del Participante"] || "Anónimo";
      
      // Submission entry
      items.push({
        type: "submit",
        text: `Nuevo envío de ${submitter} (${formName})`,
        time: sub.created_at,
        icon: "ti-inbox",
        targetTab: "submissions",
        targetId: sub.id
      });

      // Add status changes and comments
      sub.activity.forEach(act => {
        if (act.action === "status_change") {
          items.push({
            type: "action",
            text: `${act.user} actualizó estado de ${submitter} a ${act.details.split(" to ")[1]}`,
            time: act.created_at,
            icon: "ti-git-commit",
            targetTab: "submissions",
            targetId: sub.id
          });
        }
      });

      sub.comments.forEach(com => {
        items.push({
          type: "comment",
          text: `${com.author} comentó en el envío de ${submitter}`,
          time: com.created_at,
          icon: "ti-comments",
          targetTab: "submissions",
          targetId: sub.id
        });
      });
    });

    // Sort descending by date
    return items.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);
  }, [submissions, forms]);

  // ----------------------------------------------------
  // Form Builder Panel Actions
  // ----------------------------------------------------
  const addFieldToForm = (fieldType) => {
    if (!activeForm) return;

    const newField = {
      id: `fld-${Date.now()}`,
      type: fieldType,
      label: `Nuevo campo ${fieldType}`,
      placeholder: fieldType === "select" || fieldType === "radio" ? "" : "Escribe aquí...",
      required: false,
      options: fieldType === "select" || fieldType === "radio" || fieldType === "checkbox" ? ["Opción A", "Opción B"] : undefined
    };

    const updatedForms = forms.map(f => {
      if (f.id === activeForm.id) {
        return { ...f, fields: [...f.fields, newField] };
      }
      return f;
    });

    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);
    setSelectedFieldId(newField.id);
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setMobileBuilderTab("properties");
    }
  };

  const updateFieldProperty = (fieldId, property, value) => {
    if (!activeForm) return;

    const updatedForms = forms.map(f => {
      if (f.id === activeForm.id) {
        const updatedFields = f.fields.map(field => {
          if (field.id === fieldId) {
            return { ...field, [property]: value };
          }
          return field;
        });
        return { ...f, fields: updatedFields };
      }
      return f;
    });

    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);
  };

  const moveField = (index, direction) => {
    if (!activeForm) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= activeForm.fields.length) return;

    const fieldsCopy = [...activeForm.fields];
    const [moved] = fieldsCopy.splice(index, 1);
    fieldsCopy.splice(targetIndex, 0, moved);

    const updatedForms = forms.map(f => {
      if (f.id === activeForm.id) {
        return { ...f, fields: fieldsCopy };
      }
      return f;
    });

    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);
  };

  const deleteField = (fieldId) => {
    if (!activeForm) return;
    const updatedFields = activeForm.fields.filter(field => field.id !== fieldId);
    
    const updatedForms = forms.map(f => {
      if (f.id === activeForm.id) {
        return { ...f, fields: updatedFields };
      }
      return f;
    });

    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const duplicateField = (field) => {
    if (!activeForm) return;
    const duplicate = {
      ...field,
      id: `fld-${Date.now()}`,
      label: `${field.label} (Copia)`
    };

    const index = activeForm.fields.findIndex(f => f.id === field.id);
    const fieldsCopy = [...activeForm.fields];
    fieldsCopy.splice(index + 1, 0, duplicate);

    const updatedForms = forms.map(f => {
      if (f.id === activeForm.id) {
        return { ...f, fields: fieldsCopy };
      }
      return f;
    });

    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);
    setSelectedFieldId(duplicate.id);
  };

  const createNewForm = () => {
    const newForm = {
      id: `f-${Date.now()}`,
      name: "Formulario sin título",
      created_at: new Date().toISOString(),
      views: 0,
      submissionsCount: 0,
      theme: "Indigo",
      thankYouText: "¡Muchas gracias por completar el formulario!",
      redirectUrl: "",
      fields: [
        { id: `fld-${Date.now()}-1`, type: "text", label: "Nombre Completo", placeholder: "Escribe tu nombre", required: true },
        { id: `fld-${Date.now()}-2`, type: "email", label: "Email", placeholder: "correo@ejemplo.com", required: true }
      ]
    };

    const updatedForms = [...forms, newForm];
    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);
    setSelectedFormId(newForm.id);
    setSelectedFieldId(null);
    setActiveTab("form-builder");
  };

  const deleteCurrentForm = () => {
    if (forms.length <= 1) {
      alert("Debes tener al menos un formulario en tu workspace.");
      return;
    }
    if (confirm(`¿Seguro que deseas eliminar el formulario "${activeForm.name}"? Se perderán todas sus configuraciones.`)) {
      const updated = forms.filter(f => f.id !== activeForm.id);
      setForms(updated);
      saveToLocalStorage("forms", updated);
      setSelectedFormId(updated[0].id);
      setSelectedFieldId(null);
    }
  };

  // ----------------------------------------------------
  // Form Simulator / Run Workflows
  // ----------------------------------------------------
  const openFormPreview = () => {
    const initialAnswers = {};
    activeForm.fields.forEach(field => {
      initialAnswers[field.label] = field.type === "checkbox" ? [] : "";
    });
    setPreviewAnswers(initialAnswers);
    setPreviewError("");
    setShowThankYou(false);
    setCurrentStepIdx(0);
    setStepError(false);
    setIsSelectDropdownOpen(false);
    setIsPreviewOpen(true);
  };

  const getVisibleFields = () => {
    if (!activeForm || !activeForm.fields) return [];
    return activeForm.fields.filter(field => checkFieldCondition(field));
  };

  const validateCurrentStep = (field) => {
    if (!field) return true;
    if (field.required) {
      const val = previewAnswers[field.label];
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        return false;
      }
    }
    if (field.type === "email") {
      const val = previewAnswers[field.label];
      if (val && !val.includes("@")) {
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    const visibleFields = getVisibleFields();
    const currentField = visibleFields[currentStepIdx];
    if (!validateCurrentStep(currentField)) {
      setStepError(true);
      return;
    }
    setStepError(false);
    setIsSelectDropdownOpen(false);
    if (currentStepIdx < visibleFields.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      // Last step: trigger submit
      handlePreviewSubmit();
    }
  };

  const handlePrevStep = () => {
    setStepError(false);
    setIsSelectDropdownOpen(false);
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  // Keyboard navigation for Typeform step flow
  useEffect(() => {
    if (!isPreviewOpen || showThankYou) return;
    const handleGlobalKeyDown = (e) => {
      // Ignore if typing in a textarea
      if (e.target.tagName === "TEXTAREA") return;
      
      if (e.key === "Enter") {
        e.preventDefault();
        handleNextStep();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [isPreviewOpen, currentStepIdx, previewAnswers, showThankYou, activeForm]);

  const handlePreviewSubmit = (e) => {
    if (e) e.preventDefault();
    setPreviewError("");

    // Validate required fields (only if visible)
    for (let field of activeForm.fields) {
      const isVisible = checkFieldCondition(field);
      if (isVisible && field.required) {
        const val = previewAnswers[field.label];
        if (!val || (Array.isArray(val) && val.length === 0)) {
          setPreviewError(`El campo "${field.label}" es obligatorio.`);
          return;
        }
      }
    }

    // Register Form View + submission locally
    const submissionId = `sub-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSub = {
      id: submissionId,
      formId: activeForm.id,
      data: { ...previewAnswers },
      status: "pending",
      tags: [],
      created_at: new Date().toISOString(),
      comments: [],
      activity: [
        { id: `act-${Date.now()}`, action: "submitted", user: "System", details: `Formulario enviado mediante simulador por ${previewAnswers[activeForm.fields[0].label] || "Anónimo"}`, created_at: new Date().toISOString() }
      ]
    };

    // Update submissions list
    const updatedSubs = [newSub, ...submissions];
    setSubmissions(updatedSubs);
    saveToLocalStorage("submissions", updatedSubs);

    // Update Form views & submission count
    const updatedForms = forms.map(f => {
      if (f.id === activeForm.id) {
        return { ...f, views: f.views + 1, submissionsCount: f.submissionsCount + 1 };
      }
      return f;
    });
    setForms(updatedForms);
    saveToLocalStorage("forms", updatedForms);

    // Run Workflows engine against submission
    executeWorkflowsForSubmission(newSub);

    // Success response state
    setShowThankYou(true);
    if (activeForm.redirectUrl) {
      setTimeout(() => {
        setIsPreviewOpen(false);
        alert(`Redirigiendo a: ${activeForm.redirectUrl}`);
      }, 1500);
    }
  };

  const checkFieldCondition = (field) => {
    if (!field.condition || !field.condition.fieldId) return true;
    
    // Find target conditioning field
    const targetField = activeForm.fields.find(f => f.id === field.condition.fieldId);
    if (!targetField) return true;

    // Check if target condition matches current user answer value
    const currentAnswerValue = previewAnswers[targetField.label];
    return currentAnswerValue === field.condition.equalsValue;
  };

  // ----------------------------------------------------
  // Workflows Node Engine
  // ----------------------------------------------------
  const executeWorkflowsForSubmission = (submission) => {
    // Find active workflows associated with this form
    const relevantWFs = workflows.filter(w => w.formId === submission.formId && w.active);
    
    const newExecs = [...executions];
    
    relevantWFs.forEach(wf => {
      const execId = `ex-${Math.floor(100 + Math.random() * 900)}`;
      const logs = [
        `${new Date().toLocaleTimeString()} - Workflow "${wf.name}" iniciado por Envío #${submission.id}`,
      ];

      let conditionPassed = true;

      // Scan workflow nodes
      const conditionNode = wf.nodes.find(n => n.type === "condition");
      if (conditionNode) {
        // Parse conditions (e.g. Si Calificación == Excelente)
        // Find if any key matches and meets logic
        const conditionText = conditionNode.label.replace("Si ", ""); // Calificación == Excelente
        const parts = conditionText.split(" == ");
        if (parts.length === 2) {
          const fieldName = parts[0];
          const expectedVal = parts[1];
          const submissionVal = submission.data[fieldName];

          if (submissionVal === expectedVal) {
            logs.push(`${new Date().toLocaleTimeString()} - Condición evaluada: ${fieldName} ('${submissionVal}') == '${expectedVal}' => VERDADERO`);
          } else {
            logs.push(`${new Date().toLocaleTimeString()} - Condición evaluada: ${fieldName} ('${submissionVal}') == '${expectedVal}' => FALSO`);
            conditionPassed = false;
          }
        }
      }

      let status = "success";
      if (conditionPassed) {
        // Execute Action nodes
        const actionNodes = wf.nodes.filter(n => n.type === "action");
        actionNodes.forEach(act => {
          if (act.label.includes("Aprobar")) {
            submission.status = "approved";
            submission.activity.push({
              id: `act-${Date.now()}-wf`,
              action: "status_change",
              user: "Workflow Engine",
              details: "Estado cambiado a approved mediante regla de automatización",
              created_at: new Date().toISOString()
            });
            logs.push(`${new Date().toLocaleTimeString()} - Acción: Envío aprobado automáticamente.`);
          } else if (act.label.includes("Webhook")) {
            logs.push(`${new Date().toLocaleTimeString()} - Acción: Llamada Webhook POST '${act.details.split("POST ")[1]}' => Código 200 OK.`);
          } else if (act.label.includes("Email") || act.label.includes("Notify")) {
            logs.push(`${new Date().toLocaleTimeString()} - Acción: Email/Notificación enviada con éxito.`);
          }
        });
        logs.push(`${new Date().toLocaleTimeString()} - Workflow finalizado con éxito.`);
      } else {
        logs.push(`${new Date().toLocaleTimeString()} - Flujo detenido debido a que no se cumplió la condición.`);
      }

      newExecs.unshift({
        id: execId,
        workflowId: wf.id,
        submissionId: submission.id,
        status: status,
        created_at: new Date().toISOString(),
        logs: logs
      });
    });

    setExecutions(newExecs);
    saveToLocalStorage("executions", newExecs);
    
    // Save updated submissions state (in case status changed by workflow)
    const updatedSubmissions = submissions.map(s => {
      if (s.id === submission.id) return submission;
      return s;
    });
    setSubmissions(updatedSubmissions);
    saveToLocalStorage("submissions", updatedSubmissions);
  };

  const addWorkflowActionNode = (actionType) => {
    if (!activeWorkflow) return;

    let nodeLabel = "";
    let nodeDetails = "";

    if (actionType === "webhook") {
      nodeLabel = "Llamada Webhook API";
      nodeDetails = "POST https://api.acme.com/v1/kovira-trigger";
    } else if (actionType === "email") {
      nodeLabel = "Email Notificación";
      nodeDetails = "Enviar email a soporte@sorinlabs.com";
    } else if (actionType === "approve") {
      nodeLabel = "Aprobar Envío";
      nodeDetails = "Cambiar estado de envío a Approved";
    }

    const newNode = {
      id: `w-node-${Date.now()}`,
      type: "action",
      label: nodeLabel,
      details: nodeDetails
    };

    const updatedWFs = workflows.map(w => {
      if (w.id === activeWorkflow.id) {
        return { ...w, nodes: [...w.nodes, newNode] };
      }
      return w;
    });

    setWorkflows(updatedWFs);
    saveToLocalStorage("workflows", updatedWFs);
  };

  const createWorkflow = () => {
    const newWF = {
      id: `wf-${Date.now()}`,
      formId: activeForm?.id || "f-cx",
      name: "Automatización personalizada",
      active: true,
      nodes: [
        { id: `wn-${Date.now()}-1`, type: "trigger", label: "Formulario Enviado", details: activeForm?.name || "Formulario" },
        { id: `wn-${Date.now()}-2`, type: "action", label: "Llamada Webhook API", details: "POST https://api.acme.com/webhook" }
      ]
    };

    const updated = [...workflows, newWF];
    setWorkflows(updated);
    saveToLocalStorage("workflows", updated);
    setSelectedWorkflowId(newWF.id);
  };

  // ----------------------------------------------------
  // Submissions Detail Panel & Actions
  // ----------------------------------------------------
  const handleAddComment = (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !activeSubmission) return;

    const newComment = {
      id: `com-${Date.now()}`,
      author: session?.user?.name || "Kirian Luna",
      text: newCommentText,
      created_at: new Date().toISOString()
    };

    const updatedSubs = submissions.map(sub => {
      if (sub.id === activeSubmission.id) {
        return {
          ...sub,
          comments: [...sub.comments, newComment]
        };
      }
      return sub;
    });

    setSubmissions(updatedSubs);
    saveToLocalStorage("submissions", updatedSubs);
    setNewCommentText("");
  };

  const handleStatusChange = (newStatus) => {
    if (!activeSubmission) return;

    const oldStatus = activeSubmission.status;
    const newActivity = {
      id: `act-${Date.now()}`,
      action: "status_change",
      user: session?.user?.name || "Kirian Luna",
      details: `Estado cambiado de ${oldStatus} a ${newStatus}`,
      created_at: new Date().toISOString()
    };

    const updatedSubs = submissions.map(sub => {
      if (sub.id === activeSubmission.id) {
        return {
          ...sub,
          status: newStatus,
          activity: [...sub.activity, newActivity]
        };
      }
      return sub;
    });

    setSubmissions(updatedSubs);
    saveToLocalStorage("submissions", updatedSubs);
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (!newTagName.trim() || !activeSubmission) return;
    if (activeSubmission.tags.includes(newTagName.trim())) {
      setNewTagName("");
      return;
    }

    const updatedSubs = submissions.map(sub => {
      if (sub.id === activeSubmission.id) {
        return {
          ...sub,
          tags: [...sub.tags, newTagName.trim()]
        };
      }
      return sub;
    });

    setSubmissions(updatedSubs);
    saveToLocalStorage("submissions", updatedSubs);
    setNewTagName("");
  };

  const handleRemoveTag = (tagToRemove) => {
    if (!activeSubmission) return;

    const updatedSubs = submissions.map(sub => {
      if (sub.id === activeSubmission.id) {
        return {
          ...sub,
          tags: sub.tags.filter(t => t !== tagToRemove)
        };
      }
      return sub;
    });

    setSubmissions(updatedSubs);
    saveToLocalStorage("submissions", updatedSubs);
  };

  // ----------------------------------------------------
  // Export Handlers
  // ----------------------------------------------------
  const exportSubmissions = (format) => {
    if (filteredSubmissions.length === 0) {
      alert("No hay envíos para exportar.");
      return;
    }

    let fileContent = "";
    let mimeType = "";
    let fileExtension = "";

    if (format === "json") {
      fileContent = JSON.stringify(filteredSubmissions, null, 2);
      mimeType = "application/json";
      fileExtension = "json";
    } else if (format === "csv") {
      // Get all unique columns/labels
      const headerLabels = new Set();
      filteredSubmissions.forEach(sub => {
        Object.keys(sub.data).forEach(k => headerLabels.add(k));
      });
      const headers = ["ID", "Formulario", "Estado", "Tags", "Fecha Creación", ...Array.from(headerLabels)];
      
      const csvRows = [headers.join(",")];
      
      filteredSubmissions.forEach(sub => {
        const formName = forms.find(f => f.id === sub.formId)?.name || "Formulario";
        const rowData = [
          sub.id,
          `"${formName.replace(/"/g, '""')}"`,
          sub.status,
          `"${sub.tags.join("; ")}"`,
          sub.created_at,
          ...Array.from(headerLabels).map(label => {
            const val = sub.data[label] || "";
            return `"${String(val).replace(/"/g, '""')}"`;
          })
        ];
        csvRows.push(rowData.join(","));
      });
      
      fileContent = csvRows.join("\n");
      mimeType = "text/csv";
      fileExtension = "csv";
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `kovira_submissions_export_${Date.now()}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ----------------------------------------------------
  // API Keys & Members Invites
  // ----------------------------------------------------
  const generateNewAPIKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const characters = "abcdef0123456789";
    let token = "kv_live_";
    for (let i = 0; i < 24; i++) {
      token += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: token,
      created_at: new Date().toISOString(),
      status: "active"
    };

    const updatedKeys = [...apiKeys, newKey];
    setApiKeys(updatedKeys);
    saveToLocalStorage("apikeys", updatedKeys);
    setNewKeyName("");
    setGeneratedKey(token);
  };

  const revokeAPIKey = (keyId) => {
    if (confirm("¿Estás seguro de que deseas revocar esta clave API? Cualquier servicio externo perderá acceso inmediatamente.")) {
      const updatedKeys = apiKeys.map(k => {
        if (k.id === keyId) return { ...k, status: "revoked" };
        return k;
      });
      setApiKeys(updatedKeys);
      saveToLocalStorage("apikeys", updatedKeys);
    }
  };

  const inviteTeamMember = (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim()) return;

    const newMember = {
      id: `mem-${Date.now()}`,
      email: newMemberEmail,
      role: newMemberRole,
      joined: false
    };

    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveToLocalStorage("members", updatedMembers);
    setNewMemberEmail("");
    alert(`Invitación enviada con éxito a ${newMemberEmail}`);
  };

  const removeTeamMember = (memberId) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    if (member.role === "owner") {
      alert("No puedes eliminar al propietario del workspace.");
      return;
    }

    if (confirm(`¿Seguro que deseas revocar el acceso a ${member.email}?`)) {
      const updated = members.filter(m => m.id !== memberId);
      setMembers(updated);
      saveToLocalStorage("members", updated);
    }
  };

  const handleWorkspaceSettingsSave = (e) => {
    e.preventDefault();
    if (!workspaceName.trim()) return;
    localStorage.setItem(`kovira_ws_${activeWorkspace}_name`, workspaceName);
    localStorage.setItem(`kovira_ws_${activeWorkspace}_ratelimit`, String(rateLimit));
    localStorage.setItem(`kovira_ws_${activeWorkspace}_honeypot`, String(honeypotActive));
    alert("Configuraciones del workspace guardadas correctamente.");
  };

  const handleSignOut = () => {
    localStorage.removeItem("better-auth.session");
    document.cookie = "better-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
  };

  if (!isMounted) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#ECEAE3", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid #1a1a1a", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 1s linear infinite" }} />
          <div>Cargando Kovira SaaS...</div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
      {/* Mobile Sidebar Backdrop */}
      <div 
        className={`sidebar-backdrop ${isMobileSidebarOpen ? "active" : ""}`} 
        onClick={() => setIsMobileSidebarOpen(false)} 
        role="button"
        aria-label="Cerrar menú de navegación"
        tabIndex={isMobileSidebarOpen ? 0 : -1}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsMobileSidebarOpen(false); }}
      />

      {/* ============================================================
          SIDEBAR NAVIGATION (03-ui-architecture.md)
          ============================================================ */}
      <aside className={`sidebar ${isMobileSidebarOpen ? "mobile-open" : ""}`} aria-label="Menú principal">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="brand-mark flex items-center justify-center shrink-0" style={{ color: 'var(--color-ink)', width: '22px', height: '22px' }}>
            <svg style={{ width: "22px", height: "22px", minWidth: "22px", minHeight: "22px" }} viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M22.2782 6.3584C23.3828 6.3584 C24.2782 7.25383 24.2782 8.3584V15.4716C24.3202 15.4824 24.3621 15.4936 24.4038 15.5052L28.96 7.61365L30.3071 8.39141C31.2636 8.94371 31.5914 10.1669 31.0391 11.1235L27.4822 17.2841C27.5129 17.3142 27.5433 17.3446 27.5734 17.3752L35.4668 12.818L36.2446 14.1652C36.7969 15.1218 36.4691 16.3449 35.5125 16.8972L29.3536 20.4531C29.3654 20.4956 29.3768 20.5382 29.3878 20.5811H38.5V22.1366C38.5 23.2412 37.6046 24.1366 36.5 24.1366H29.3878C29.377 24.1787 29.3658 24.2207 29.3542 24.2625L37.2446 28.818L36.4668 30.1652C35.9145 31.1218 34.6913 31.4495 33.7347 30.8973L27.5748 27.3409C27.5446 27.3717 27.5141 27.4022 27.4833 27.4324L32.0401 35.325L30.6931 36.1028C29.7365 36.6551 28.5133 36.3273 27.961 35.3708L24.4052 29.212C24.363 29.2237 24.3207 29.235 24.2782 29.2459V38.3584H22.7227C21.6181 38.3584 20.7227 37.463 20.7227 36.3584V29.2458C20.6802 29.2349 20.6379 29.2235 20.5958 29.2119L16.0392 37.1042L14.692 36.3264C13.7354 35.7742 13.4077 34.551 13.96 33.5944L17.5178 27.432C17.4868 27.4016 17.456 27.3708 17.4256 27.3398L9.53168 31.8973L8.75387 30.55C8.2016 29.5934 8.52936 28.3703 9.48594 27.818L15.6469 24.261C15.6355 24.2197 15.6244 24.1782 15.6137 24.1366H6.5V22.5811C6.5 21.4765 7.39543 20.5811 8.5 20.5811H15.6137C15.6246 20.5388 15.6358 20.4966 15.6475 20.4546L7.75391 15.8972L8.53169 14.5501C9.08397 13.5935 10.3071 13.2657 11.2637 13.818L17.427 17.3763C17.4573 17.3455 17.4879 17.3148 17.5188 17.2845L12.9609 9.39008L14.3081 8.61231C15.2647 8.06002 16.4879 8.38777 17.0401 9.34436L20.5972 15.5053C20.6388 15.4938 20.6807 15.4826 20.7227 15.4718V6.3584H22.2782ZM25.647 24.0166L25.5129 24.2489C25.2237 24.7087 24.8322 25.0977 24.3703 25.3838L24.1802 25.4935C23.6947 25.7542 23.1416 25.9053 22.554 25.914H22.4475C20.5083 25.8855 18.9452 24.3047 18.9452 22.3588C18.9452 20.3951 20.537 18.8032 22.5008 18.8032C23.1125 18.8032 23.6882 18.9577 24.1909 19.2298L24.3599 19.3274C24.8366 19.6204 25.239 20.0227 25.532 20.4994L25.6299 20.669C25.8909 21.1513 26.0436 21.7007 26.0556 22.2847V22.4329C26.0439 23.0041 25.8975 23.5421 25.647 24.0166Z" fill="currentColor"/>
            </svg>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <button 
              className="sidebar-collapse-btn p-1.5 rounded hover:bg-neutral-100 transition-colors shrink-0" 
              onClick={() => setIsSidebarCollapsed(true)}
              aria-label="Colapsar barra lateral"
              title="Colapsar barra lateral"
              style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-ash)" }}
            >
              <Lucide.ChevronLeft size={16} />
            </button>
            <button 
              className="mobile-menu-close p-1.5 rounded hover:bg-neutral-100 active:bg-neutral-200 transition-colors shrink-0" 
              onClick={() => setIsMobileSidebarOpen(false)}
              aria-label="Cerrar menú de navegación"
              style={{ border: "none", background: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", color: "var(--color-ash)" }}
            >
              <Icon name="x" size={16} />
            </button>
          </div>
        </div>

        {/* Workspace Switcher Card */}
        <div className="sidebar-workspace-card border border-[#ededed] rounded-[8px] bg-white p-2 flex items-center justify-between shadow-subtle hover:border-[#cbcbcb] transition-colors mb-3 relative">
          <button
            onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
            className="flex items-center gap-2 w-full text-left focus:outline-none bg-transparent border-none cursor-pointer"
            style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: 0 }}
          >
            <div className="w-6 h-6 rounded bg-[#262626] flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
              {activeWorkspace === "personal" ? "K" : "A"}
            </div>
            <div className="flex flex-col min-w-0 text-left">
              <span className="text-xs font-extrabold text-[#262626] leading-tight truncate">
                {activeWorkspace === "personal" ? "Mi Workspace" : "Acme Corp"}
              </span>
              <span className="text-[10px] text-[#686868] mt-0.5 leading-none truncate">
                {workspaceName}
              </span>
            </div>
            <Lucide.ChevronsUpDown size={12} className="text-[#929292] shrink-0 ml-auto" />
          </button>

          {isWorkspaceDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-45" 
                style={{ zIndex: 9998 }}
                onClick={() => setIsWorkspaceDropdownOpen(false)}
              />
              <div 
                className="absolute left-0 right-0 mt-1 w-full bg-white border border-neutral-200 rounded-md shadow-lg py-1.5"
                style={{ borderColor: "var(--color-soft-mist)", boxShadow: "var(--shadow-subtle)", zIndex: 9999, top: "100%" }}
              >
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Workspaces
                </div>
                <button
                  onClick={() => {
                    setActiveWorkspace("personal");
                    setActiveTab("dashboard");
                    setIsWorkspaceDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 transition-colors ${activeWorkspace === "personal" ? "font-semibold text-neutral-900" : "text-neutral-600"}`}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span>Mi Workspace</span>
                  {activeWorkspace === "personal" && <Lucide.Check size={12} className="text-neutral-900" />}
                </button>
                <button
                  onClick={() => {
                    setActiveWorkspace("acme");
                    setActiveTab("dashboard");
                    setIsWorkspaceDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between w-full text-left px-3 py-2 text-xs hover:bg-neutral-50 transition-colors ${activeWorkspace === "acme" ? "font-semibold text-neutral-900" : "text-neutral-600"}`}
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span>Acme Corp</span>
                  {activeWorkspace === "acme" && <Lucide.Check size={12} className="text-neutral-900" />}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search Input (Matches Quno Sidebar style) */}
        <div className="relative mb-3 flex items-center">
          <Lucide.Search className="absolute left-2.5 text-[#929292] pointer-events-none" size={13} style={{ position: "absolute", left: "10px" }} />
          <input 
            type="text" 
            placeholder="Search here" 
            className="w-full bg-[#fbfbfb] border border-[#ededed] rounded-[4px] pl-8 pr-7 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#262626] placeholder-[#929292]/60 font-sans"
            style={{ width: "100%" }}
            disabled
          />
          <span className="absolute right-2.5 text-[9px] font-medium text-[#929292] border border-[#ededed] bg-white rounded px-1.5 py-0.5 leading-none font-mono" style={{ position: "absolute", right: "10px" }}>/</span>
        </div>

        <div className="sidebar-divider" />

        {/* 03-ui-architecture.md Layout links */}
        <div className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => { setActiveTab("dashboard"); setIsMobileSidebarOpen(false); }}>
          <div className="nav-icon"><Icon name="dashboard" /></div>
          Dashboard
        </div>
        <div className={`nav-item ${activeTab === "form-builder" ? "active" : ""}`} onClick={() => { setActiveTab("form-builder"); setIsMobileSidebarOpen(false); }}>
          <div className="nav-icon"><Icon name="form" /></div>
          Form Builder
        </div>
        <div className={`nav-item ${activeTab === "submissions" ? "active" : ""}`} onClick={() => { setActiveTab("submissions"); setIsMobileSidebarOpen(false); }}>
          <div className="nav-icon"><Icon name="inbox" /></div>
          Submissions
          {submissions.filter(s => s.status === "pending").length > 0 && (
            <span style={{ marginLeft: "auto", background: "var(--color-ink)", color: "var(--color-pure-paper)", fontSize: 9, padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>
              {submissions.filter(s => s.status === "pending").length}
            </span>
          )}
        </div>
        <div className={`nav-item ${activeTab === "workflows" ? "active" : ""}`} onClick={() => { setActiveTab("workflows"); setIsMobileSidebarOpen(false); }}>
          <div className="nav-icon"><Icon name="flow" /></div>
          Workflows
        </div>
        <div className={`nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => { setActiveTab("analytics"); setIsMobileSidebarOpen(false); }}>
          <div className="nav-icon"><Icon name="chart-pie" /></div>
          Analytics
        </div>

        <div className="sidebar-divider" />
        <div className="nav-section-label">Configuración</div>

        <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => { setActiveTab("settings"); setIsMobileSidebarOpen(false); }}>
          <div className="nav-icon"><Icon name="cog" /></div>
          Workspace &amp; API
        </div>

        {/* User profile card */}
        <div className="sidebar-bottom">
          <div className="profile-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
              <div className="avatar">
                {session?.user?.name
                  ? session.user.name.substring(0, 2).toUpperCase()
                  : (session?.user?.email ? session.user.email.substring(0, 2).toUpperCase() : "KL")}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="profile-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontWeight: 600 }}>
                  {session?.user?.name || "Kirian Luna"}
                </div>
                <div className="profile-role" style={{ fontSize: 10, color: "var(--color-slate)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={session?.user?.email || "kirian@kovira.dev"}>
                  {session?.user?.email || "Sorin Labs · Owner"}
                </div>
              </div>
            </div>
            <button 
              onClick={handleSignOut} 
              className="btn-logout" 
              title="Cerrar sesión"
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "6px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "var(--radius-buttons)",
                color: "var(--color-slate)",
                transition: "color 0.2s, background-color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
              onMouseLeave={(e) => e.currentTarget.style.color = "var(--color-slate)"}
            >
              <Icon name="log-out" size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ============================================================
          MAIN WORKSPACE
          ============================================================ */}
      <main className="main">
        <div className="workspace-panel">
          {/* Topbar with breadcrumb & actions */}
          <header className="topbar">
          <div className="breadcrumb" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => {
                if (window.innerWidth <= 768) {
                  setIsMobileSidebarOpen(true);
                } else {
                  setIsSidebarCollapsed(false);
                }
              }}
              aria-label="Abrir menú de navegación"
              aria-expanded={isMobileSidebarOpen}
            >
              <Icon name="menu" size={16} style={{ color: 'var(--color-ink)' }} />
            </button>
            
            {/* Bordered Navigation Buttons */}
            <div className="hidden md:flex items-center" style={{ display: "flex", alignItems: "center", border: "1px solid var(--color-soft-mist)", borderRadius: "var(--radius-buttons)", backgroundColor: "var(--color-pure-paper)", overflow: "hidden" }}>
              <button 
                onClick={() => window.history.back()}
                className="hover:bg-[#fafafa] flex items-center justify-center"
                style={{ background: "none", border: "none", borderRight: "1px solid var(--color-soft-mist)", padding: "3px 5px", cursor: "pointer", color: "var(--color-slate)" }}
                title="Atrás"
              >
                <Lucide.ChevronLeft size={12} />
              </button>
              <button 
                onClick={() => window.history.forward()}
                className="hover:bg-[#fafafa] flex items-center justify-center"
                style={{ background: "none", border: "none", padding: "3px 5px", cursor: "pointer", color: "var(--color-slate)" }}
                title="Adelante"
              >
                <Lucide.ChevronRight size={12} />
              </button>
            </div>

            {/* Divider */}
            <div className="hidden md:block" style={{ height: "14px", width: "1px", backgroundColor: "var(--color-soft-mist)", margin: "0 2px" }} />

            <span>Workspaces</span> 
            <Lucide.ChevronRight size={10} style={{ color: 'var(--color-fog)' }} /> 
            <span>{workspaceName}</span> 
            <Lucide.ChevronRight size={10} style={{ color: 'var(--color-fog)' }} /> 
            <b style={{ textTransform: "capitalize" }}>{activeTab.replace("-", " ")}</b>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/" target="_blank" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <Icon name="new-window-page" style={{ width: 12, height: 12 }} /> <span className="hide-on-mobile">Ver Landing Page</span>
            </a>
            <button className="btn btn-secondary" style={{ padding: "6px 10px" }} onClick={() => alert("No tienes notificaciones pendientes.")}>
              <Icon name="bell" style={{ width: 12, height: 12 }} />
            </button>
            <div className="avatar" style={{ width: 28, height: 28, fontSize: 10 }}>KL</div>
          </div>
        </header>

        {/* Tab content wrappers */}
        <div className="content">

          {/* ============================================================
              TAB: DASHBOARD
              ============================================================ */}
          <div className={`tab-content ${activeTab === "dashboard" ? "active" : ""}`}>
            <div className="greeting">
              <h3>¡Hola de nuevo, Kirian!</h3>
              <p>Aquí tienes el estado actual de tu recolector de datos en <b>{workspaceName}</b>.</p>
            </div>

            {/* Metrics cards (03-ui-architecture.md stats cards) */}
            <div className="metric-grid">
              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon"><Icon name="form" style={{ width: 12, height: 12, color: 'var(--color-slate)' }} /></div>
                  Total Forms
                </div>
                <div className="metric-val">{forms.length}</div>
                <div className="metric-delta" style={{ color: "var(--color-ash)" }}>Creados en workspace</div>
              </div>

              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon"><Icon name="inbox" style={{ width: 12, height: 12, color: 'var(--color-slate)' }} /></div>
                  Submissions
                </div>
                <div className="metric-val">{submissions.length}</div>
                <div className="metric-delta" style={{ color: "var(--color-slate)" }}>
                  +{submissions.length} totales
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon"><Icon name="flow" style={{ width: 12, height: 12, color: 'var(--color-slate)' }} /></div>
                  Workflows
                </div>
                <div className="metric-val">{workflows.filter(w => w.active).length}</div>
                <div className="metric-delta" style={{ color: "var(--color-ash)" }}>
                  Activos e instrumentados
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon"><Icon name="chart-pie" style={{ width: 12, height: 12, color: 'var(--color-slate)' }} /></div>
                  Conversión
                </div>
                <div className="metric-val">{overallConversion}%</div>
                <div className="metric-delta" style={{ color: "var(--color-ash)" }}>De vistas a registros</div>
              </div>
            </div>

            {/* Layout grid for activity and actions */}
            <div className="responsive-grid-2col" style={{ marginTop: 24 }}>
              {/* Quick Actions (03-ui-architecture.md) */}
              <div style={{ background: "var(--color-pure-paper)", border: "1px solid var(--color-soft-mist)", borderRadius: "var(--radius-cards)", padding: "20px", boxShadow: "var(--shadow-subtle)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--color-soft-mist)", paddingBottom: 10, marginBottom: 16 }}>
                  Acciones Rápidas
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={createNewForm}>
                    <Icon name="plus" style={{ width: 12, height: 12, color: 'var(--color-pure-paper)' }} /> Crear Nuevo Formulario
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: "center" }} onClick={() => setActiveTab("submissions")}>
                    <Icon name="inbox" style={{ width: 12, height: 12 }} /> Examinar Envíos
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: "center" }} onClick={createWorkflow}>
                    <Icon name="flow" style={{ width: 12, height: 12 }} /> Configurar Automatización
                  </button>
                </div>
                <div className="sidebar-divider" style={{ margin: "20px -20px" }} />
                <div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, color: "var(--color-ash)", marginBottom: 8 }}>Formulario Activo</h5>
                  {activeForm ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{activeForm.name}</span>
                      <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setActiveTab("form-builder")}>Editar</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--color-ash)" }}>No hay formularios activos.</span>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{ background: "var(--color-pure-paper)", border: "1px solid var(--color-soft-mist)", borderRadius: "var(--radius-cards)", padding: "20px", boxShadow: "var(--shadow-subtle)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                  Bitácora de Actividad Reciente
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {activityFeed.length > 0 ? (
                    activityFeed.map((act, i) => (
                      <div 
                        key={i} 
                        style={{ display: "flex", alignItems: "flex-start", gap: 12, fontSize: 13, cursor: "pointer" }}
                        onClick={() => {
                          setActiveTab(act.targetTab);
                          setSelectedSubmissionId(act.targetId);
                        }}
                      >
                        <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--bg-surface-sunken)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <i className={`ti ${act.icon}`} style={{ color: "var(--text-secondary)", fontSize: 13 }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500, color: "var(--text-primary)" }}>{act.text}</div>
                          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                            {new Date(act.time).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: "center", color: "var(--text-tertiary)", padding: "24px 0", fontSize: 13 }}>
                      No se ha registrado ninguna actividad aún en este workspace.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Help Card (Design_System.md section 3) */}
            <div className="help-card" style={{ marginTop: 24 }}>
              <div className="help-icon"><i className="ti ti-help-circle" /></div>
              <div className="help-text">
                <strong>¿Quieres integrar Kovira en tu sitio web?</strong>
                <span>Puedes incrustar formularios mediante iFrame o usando scripts headless sin marca. Mira las configuraciones en Form Builder.</span>
              </div>
              <button className="btn btn-secondary" style={{ marginLeft: "auto" }} onClick={() => setActiveTab("form-builder")}>Configurar Embed</button>
            </div>
          </div>

          {/* ============================================================
              TAB: FORM BUILDER
              ============================================================ */}
          <div className={`tab-content ${activeTab === "form-builder" ? "active" : ""}`}>
            {forms.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <h3>No hay formularios</h3>
                <button className="btn btn-primary" onClick={createNewForm} style={{ marginTop: 12 }}>Crear uno ahora</button>
              </div>
            ) : (
              <div>
                {/* Header selectors */}
                <div className="builder-header-row">
                  <div className="builder-header-left">
                    <span className="builder-header-label" style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)" }}>Formulario:</span>
                    <select 
                      className="filter-select"
                      value={selectedFormId || ""}
                      onChange={(e) => {
                        setSelectedFormId(e.target.value);
                        setSelectedFieldId(null);
                      }}
                      style={{ fontSize: 13, fontWeight: 600 }}
                    >
                      {forms.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12 }} onClick={createNewForm} title="Nuevo Formulario">
                      <Icon name="plus" size={12} /> <span className="hide-on-mobile">Nuevo</span>
                    </button>
                  </div>
                  <div className="builder-header-right">
                    <button className="btn btn-secondary" onClick={openFormPreview} style={{ background: "#4338ca", color: "#FFF" }}>
                      <Icon name="eye" size={12} style={{ color: "#FFF", marginRight: 4 }} /> <span>Probar Formulario</span>
                    </button>
                    <button className="btn btn-secondary btn-danger" onClick={deleteCurrentForm} title="Eliminar Formulario">
                      <Icon name="trash" size={12} style={{ marginRight: 4 }} /> <span className="hide-on-mobile">Eliminar</span>
                    </button>
                  </div>
                </div>

                {/* Mobile Builder Tab Segmented Control */}
                <div className="builder-mobile-tabs">
                  <button 
                    className={`btn ${mobileBuilderTab === "canvas" ? "btn-primary" : "btn-secondary"}`} 
                    style={{ flex: 1, padding: "8px 0", fontSize: "12px", borderRadius: 4 }}
                    onClick={() => setMobileBuilderTab("canvas")}
                  >
                    <Lucide.LayoutDashboard size={13} style={{ marginRight: 6 }} /> Lienzo
                  </button>
                  <button 
                    className={`btn ${mobileBuilderTab === "elements" ? "btn-primary" : "btn-secondary"}`} 
                    style={{ flex: 1, padding: "8px 0", fontSize: "12px", borderRadius: 4 }}
                    onClick={() => setMobileBuilderTab("elements")}
                  >
                    <Lucide.Plus size={13} style={{ marginRight: 6 }} /> Elementos
                  </button>
                  <button 
                    className={`btn ${mobileBuilderTab === "properties" ? "btn-primary" : "btn-secondary"}`} 
                    style={{ flex: 1, padding: "8px 0", fontSize: "12px", borderRadius: 4, position: "relative" }}
                    onClick={() => setMobileBuilderTab("properties")}
                  >
                    <Lucide.SlidersHorizontal size={13} style={{ marginRight: 6 }} /> Propiedades
                    {selectedFieldId && (
                      <span style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} />
                    )}
                  </button>
                </div>

                {/* 3-Panel Layout (03-ui-architecture.md) */}
                <DndContext 
                  sensors={sensors} 
                  collisionDetection={closestCenter} 
                  onDragStart={handleDragStart}
                  onDragCancel={handleDragCancel}
                  onDragEnd={handleDragEnd}
                >
                  <div className="builder-layout">
                    
                    {/* Left panel: components list */}
                    <div className={`builder-panel ${mobileBuilderTab === "elements" ? "mobile-visible" : "mobile-hidden"}`}>
                      <div className="builder-panel-title">Elementos</div>
                      <div className="builder-sub" style={{ fontSize: 11.5, margin: "0 0 10px 0" }}>Haz clic o arrastra un componente para agregarlo al formulario:</div>
                      <div className="field-chip-list">
                        {[
                          { type: "text", label: "Texto Corto", icon: "text-icon" },
                          { type: "email", label: "Correo Electrónico", icon: "email-icon" },
                          { type: "number", label: "Número", icon: "number-icon" },
                          { type: "select", label: "Lista Desplegable", icon: "select-icon" },
                          { type: "checkbox", label: "Opción Múltiple", icon: "checkbox-icon" },
                          { type: "radio", label: "Opción Única", icon: "radio-icon" },
                          { type: "date", label: "Selector Fecha", icon: "date-icon" },
                          { type: "file", label: "Subir Archivo", icon: "file-icon" }
                        ].map((item) => (
                          <DraggableFieldChip
                            key={item.type}
                            item={item}
                            addFieldToForm={addFieldToForm}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Center panel: builder canvas */}
                    <div className={`builder-canvas ${mobileBuilderTab === "canvas" ? "mobile-visible" : "mobile-hidden"}`}>
                      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-md)", padding: "16px 20px", marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-tertiary)" }}>Título del Formulario</label>
                        <input 
                          type="text" 
                          value={activeForm.name} 
                          onChange={(e) => {
                            const updated = forms.map(f => f.id === activeForm.id ? { ...f, name: e.target.value } : f);
                            setForms(updated);
                            saveToLocalStorage("forms", updated);
                          }} 
                          style={{ width: "100%", border: "none", borderBottom: "1px solid var(--border-soft)", fontSize: 18, fontWeight: 700, padding: "8px 0", marginTop: 4, outline: "none", color: "var(--text-primary)" }}
                        />
                      </div>

                      <DroppableCanvas id="canvas-droppable">
                        <SortableContext items={activeForm.fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                          {activeForm.fields.map((field, idx) => (
                            <SortableField
                              key={field.id}
                              field={field}
                              idx={idx}
                              selectedFieldId={selectedFieldId}
                              setSelectedFieldId={handleSelectField}
                              activeForm={activeForm}
                              duplicateField={duplicateField}
                              deleteField={deleteField}
                              moveField={moveField}
                            />
                          ))}
                        </SortableContext>

                        {activeForm.fields.length === 0 && (
                          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-tertiary)", fontSize: 13 }}>
                            El formulario está vacío. Arrastra los elementos de la izquierda o haz clic en ellos para agregarlos.
                          </div>
                        )}
                      </DroppableCanvas>

                      {/* Form settings options embedded in canvas footer */}
                      <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-lg)", padding: "20px", marginTop: 24 }}>
                        <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 8 }}>
                          Configuraciones de Envío &amp; Apariencia
                        </h4>
                        <div className="responsive-grid-form-settings">
                          <div className="form-group">
                            <label>Tema del Formulario</label>
                            <select 
                              className="form-select"
                              value={activeForm.theme || "Indigo"}
                              onChange={(e) => {
                                const updated = forms.map(f => f.id === activeForm.id ? { ...f, theme: e.target.value } : f);
                                setForms(updated);
                                saveToLocalStorage("forms", updated);
                              }}
                            >
                              <option value="Indigo">Indigo / Azul Real</option>
                              <option value="Sage">Sage / Verde Menta</option>
                              <option value="Rose">Rose / Fucsia Elegante</option>
                              <option value="Obsidian">Obsidian / Negro Carbón</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label>Redirección URL (Opcional)</label>
                            <input 
                              type="text" 
                              className="form-input"
                              placeholder="https://misitio.com/gracias"
                              value={activeForm.redirectUrl || ""}
                              onChange={(e) => {
                                const updated = forms.map(f => f.id === activeForm.id ? { ...f, redirectUrl: e.target.value } : f);
                                setForms(updated);
                                saveToLocalStorage("forms", updated);
                              }}
                            />
                          </div>
                          <div className="form-group form-settings-span-2">
                            <label>Mensaje de Agradecimiento</label>
                            <textarea 
                              rows="2"
                              className="form-textarea"
                              value={activeForm.thankYouText || ""}
                              onChange={(e) => {
                                const updated = forms.map(f => f.id === activeForm.id ? { ...f, thankYouText: e.target.value } : f);
                                setForms(updated);
                                saveToLocalStorage("forms", updated);
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right panel: properties */}
                    <div className={`builder-panel ${mobileBuilderTab === "properties" ? "mobile-visible" : "mobile-hidden"}`}>
                      <div className="builder-panel-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Lucide.Settings size={14} style={{ color: "var(--color-slate)" }} />
                        <span>Propiedades</span>
                      </div>
                      {selectedFieldId ? (
                        (() => {
                          const field = activeForm.fields.find(f => f.id === selectedFieldId);
                          if (!field) return <div style={{ fontSize: 13, color: "var(--text-tertiary)", padding: 12 }}>Campo no encontrado.</div>;
                          return (
                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                              <div className="form-group">
                                <label htmlFor={`prop-label-${field.id}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-slate)" }}>
                                  <Lucide.Type size={13} style={{ color: "var(--color-ash)" }} />
                                  <span>Etiqueta / Pregunta</span>
                                </label>
                                <input 
                                  id={`prop-label-${field.id}`}
                                  type="text" 
                                  className="form-input" 
                                  value={field.label} 
                                  onChange={(e) => updateFieldProperty(field.id, "label", e.target.value)} 
                                />
                              </div>

                              {field.type !== "select" && field.type !== "radio" && field.type !== "checkbox" && (
                                <div className="form-group">
                                  <label htmlFor={`prop-placeholder-${field.id}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-slate)" }}>
                                    <Lucide.AlignLeft size={13} style={{ color: "var(--color-ash)" }} />
                                    <span>Marcador de posición</span>
                                  </label>
                                  <input 
                                    id={`prop-placeholder-${field.id}`}
                                    type="text" 
                                    className="form-input" 
                                    value={field.placeholder || ""} 
                                    onChange={(e) => updateFieldProperty(field.id, "placeholder", e.target.value)} 
                                  />
                                </div>
                              )}

                              <div className="form-group">
                                <label className="option-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface-sunken)", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border-soft)", width: "100%", margin: 0, cursor: "pointer" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Lucide.Asterisk size={14} style={{ color: field.required ? "#ef4444" : "var(--color-ash)" }} />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>Respuesta Obligatoria</span>
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    checked={field.required || false} 
                                    onChange={(e) => updateFieldProperty(field.id, "required", e.target.checked)} 
                                    style={{ width: 16, height: 16, accentColor: "var(--color-ink)", cursor: "pointer" }}
                                  />
                                </label>
                              </div>

                              {/* Options builder for radio, select, checkbox */}
                              {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                                <div className="form-group">
                                  <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 600, color: "var(--color-slate)" }}>
                                    <Lucide.List size={13} style={{ color: "var(--color-ash)" }} />
                                    <span>Opciones de respuesta</span>
                                  </label>
                                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                                    {(field.options || []).map((opt, oIdx) => (
                                      <div key={oIdx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                        {field.type === "radio" && (
                                          <div style={{ width: 6, height: 6, borderRadius: "50%", border: "1.5px solid var(--color-ash)", flexShrink: 0 }} />
                                        )}
                                        {field.type === "checkbox" && (
                                          <div style={{ width: 6, height: 6, borderRadius: "1.5px", border: "1.5px solid var(--color-ash)", flexShrink: 0 }} />
                                        )}
                                        {field.type === "select" && (
                                          <Lucide.ChevronDown size={12} style={{ color: "var(--color-ash)", flexShrink: 0 }} />
                                        )}
                                        <input 
                                          type="text" 
                                          className="form-input" 
                                          style={{ padding: "6px 8px" }}
                                          value={opt} 
                                          onChange={(e) => {
                                            const opts = [...field.options];
                                            opts[oIdx] = e.target.value;
                                            updateFieldProperty(field.id, "options", opts);
                                          }}
                                        />
                                        <button 
                                          className="btn-field-action" 
                                          style={{ color: "#ef4444", flexShrink: 0 }}
                                          onClick={() => {
                                            const opts = field.options.filter((_, idx) => idx !== oIdx);
                                            updateFieldProperty(field.id, "options", opts);
                                          }}
                                          disabled={(field.options || []).length <= 1}
                                        >
                                          <Lucide.X size={14} />
                                        </button>
                                      </div>
                                    ))}
                                    <button 
                                      className="btn btn-secondary" 
                                      style={{ padding: "6px 10px", fontSize: 11, justifyContent: "center", display: "flex", alignItems: "center", gap: 4 }}
                                      onClick={() => {
                                        const opts = [...(field.options || []), `Nueva opción ${(field.options || []).length + 1}`];
                                        updateFieldProperty(field.id, "options", opts);
                                      }}
                                    >
                                      <Lucide.Plus size={12} /> Agregar opción
                                    </button>
                                  </div>
                                </div>
                              )}

                              <div className="sidebar-divider" style={{ margin: "6px -16px" }} />
                              
                              {/* Conditional Visibility */}
                              <div className="form-group">
                                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, fontWeight: 700, color: "var(--color-ink)" }}>
                                  <Lucide.GitBranch size={13} style={{ color: "var(--color-ash)" }} />
                                  <span>Lógica de Visibilidad</span>
                                </label>
                                <label className="option-label" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--bg-surface-sunken)", padding: "10px 12px", borderRadius: 6, border: "1px solid var(--border-soft)", width: "100%", margin: "6px 0 0 0", cursor: "pointer" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <Lucide.Eye size={14} style={{ color: !!field.condition ? "var(--color-ink)" : "var(--color-ash)" }} />
                                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-ink)" }}>Mostrar condicionalmente</span>
                                  </div>
                                  <input 
                                    type="checkbox" 
                                    checked={!!field.condition} 
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        const other = activeForm.fields.find(f => f.id !== field.id && (f.type === "select" || f.type === "radio" || f.type === "text"));
                                        updateFieldProperty(field.id, "condition", {
                                          fieldId: other ? other.id : "",
                                          equalsValue: other && other.options ? other.options[0] : "Valor"
                                        });
                                      } else {
                                        updateFieldProperty(field.id, "condition", null);
                                      }
                                    }} 
                                    style={{ width: 16, height: 16, accentColor: "var(--color-ink)", cursor: "pointer" }}
                                  />
                                </label>

                                {field.condition && (
                                  <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "var(--bg-surface-sunken)", padding: 12, borderRadius: 6, border: "1px solid var(--border-soft)", marginTop: 8 }}>
                                    <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500 }}>Mostrar este campo si:</span>
                                    
                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      <span style={{ fontSize: 10.5, color: "var(--color-ash)", fontWeight: 600, textTransform: "uppercase" }}>Campo origen</span>
                                      <select
                                        className="form-select"
                                        style={{ padding: "6px 28px 6px 10px", fontSize: 12 }}
                                        value={field.condition.fieldId}
                                        onChange={(e) => {
                                          const targetF = activeForm.fields.find(f => f.id === e.target.value);
                                          updateFieldProperty(field.id, "condition", {
                                            fieldId: e.target.value,
                                            equalsValue: targetF && targetF.options ? targetF.options[0] : "Valor"
                                          });
                                        }}
                                      >
                                        <option value="">Selecciona campo...</option>
                                        {activeForm.fields.filter(f => f.id !== field.id).map(f => (
                                          <option key={f.id} value={f.id}>{f.label || f.type}</option>
                                        ))}
                                      </select>
                                    </div>

                                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                      <span style={{ fontSize: 10.5, color: "var(--color-ash)", fontWeight: 600, textTransform: "uppercase" }}>Es igual a</span>
                                      {(() => {
                                        const targetF = activeForm.fields.find(f => f.id === field.condition.fieldId);
                                        if (targetF && (targetF.type === "select" || targetF.type === "radio")) {
                                          return (
                                            <select
                                              className="form-select"
                                              style={{ padding: "6px 28px 6px 10px", fontSize: 12 }}
                                              value={field.condition.equalsValue}
                                              onChange={(e) => {
                                                updateFieldProperty(field.id, "condition", {
                                                  ...field.condition,
                                                  equalsValue: e.target.value
                                                });
                                              }}
                                            >
                                              {(targetF.options || []).map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                              ))}
                                            </select>
                                          );
                                        }
                                        return (
                                          <input 
                                            type="text" 
                                            className="form-input" 
                                            style={{ padding: "6px 10px", fontSize: 12 }}
                                            value={field.condition.equalsValue}
                                            onChange={(e) => {
                                              updateFieldProperty(field.id, "condition", {
                                                ...field.condition,
                                                equalsValue: e.target.value
                                              });
                                            }}
                                          />
                                        );
                                      })()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-tertiary)", fontSize: 12.5 }}>
                          <Lucide.Sliders size={20} style={{ color: "var(--color-fog)", marginBottom: 8 }} />
                          <div>Selecciona un campo en el lienzo para ver y editar sus atributos.</div>
                        </div>
                      )}
                    </div>
                  </div>
                  <DragOverlay dropAnimation={null}>
                    {activeDragId ? (
                      activeDragId.toString().startsWith("new-") ? (
                        <div className="field-chip dragging-overlay" style={{ cursor: "grabbing" }}>
                          <Icon name={getFieldIcon(activeDragId.toString().replace("new-", ""))} size={13} style={{ color: "var(--color-slate)" }} />
                          {getFieldLabel(activeDragId.toString().replace("new-", ""))}
                        </div>
                      ) : (
                        <div className="canvas-field dragging-overlay" style={{ cursor: "grabbing", opacity: 0.9, background: "var(--color-pure-paper)", border: "1px solid var(--color-ink)", boxShadow: "0 10px 25px rgba(0,0,0,0.15)", borderRadius: "8px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div className="canvas-field-header-row">
                            <div className="canvas-field-drag">
                              <Icon name="grip-vertical" size={14} style={{ color: "var(--color-ink)" }} />
                            </div>
                            <div className="canvas-field-title-wrap">
                              <span className="canvas-field-label" style={{ fontWeight: 600, fontSize: 13, color: "var(--color-ink)" }}>
                                {activeForm.fields.find(f => f.id === activeDragId)?.label || "Campo"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {/* iFrame Embed codes block */}
                <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", marginTop: 24, boxShadow: "var(--shadow-card)" }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}><i className="ti ti-code" /> Código de Incrustación (Embedding)</h4>
                  <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 12 }}>Copia este fragmento HTML para incrustar el formulario en cualquier sitio web o plataforma corporativa:</p>
                  <div style={{ background: "var(--bg-surface-sunken)", border: "1px solid var(--border-soft)", padding: 12, borderRadius: 6, fontFamily: "var(--font-mono)", fontSize: 11.5, position: "relative" }}>
                    <code>{`<iframe src="https://app.kovira.io/embed/${activeForm.id}" width="100%" height="600" style="border:none;border-radius:12px;"></iframe>`}</code>
                    <button 
                      className="btn btn-secondary" 
                      style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", padding: "4px 8px", fontSize: 10 }}
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src="https://app.kovira.io/embed/${activeForm.id}" width="100%" height="600" style="border:none;border-radius:12px;"></iframe>`);
                        alert("Código de inserción copiado al portapapeles.");
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              TAB: SUBMISSIONS
              ============================================================ */}
          <div className={`tab-content ${activeTab === "submissions" ? "active" : ""}`}>
            
            {/* Notion style spreadsheet layout filters & search */}
            <div className="submissions-actions">
              <div className="search-input-wrap">
                <i className="ti ti-search" />
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Buscar respuestas..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <select 
                  className="filter-select"
                  value={filterFormId}
                  onChange={(e) => setFilterFormId(e.target.value)}
                >
                  <option value="all">Todos los Formularios</option>
                  {forms.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>

                <select 
                  className="filter-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">Todos los Estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="reviewed">Revisados</option>
                  <option value="approved">Aprobados</option>
                  <option value="rejected">Rechazados</option>
                </select>

                <select 
                  className="filter-select"
                  value={filterTag}
                  onChange={(e) => setFilterTag(e.target.value)}
                >
                  <option value="all">Todas las Etiquetas</option>
                  {allAvailableTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>

                <div className="hide-on-mobile" style={{ height: 24, width: 1, background: "var(--border-soft)", margin: "0 4px" }} />

                <button className="btn btn-secondary" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }} onClick={() => exportSubmissions("csv")}>
                  <i className="ti ti-file-text" /> Exportar CSV
                </button>
                <button className="btn btn-secondary" style={{ padding: "8px 12px", display: "flex", alignItems: "center", gap: 6 }} onClick={() => exportSubmissions("json")}>
                  <i className="ti ti-braces" /> Exportar JSON
                </button>
              </div>
            </div>

            {/* Notion Table */}
            <div className="spreadsheet-container">
              {filteredSubmissions.length > 0 ? (
                <table className="spreadsheet-table">
                  <thead>
                    <tr>
                      <th style={{ width: 100 }}>ID</th>
                      <th style={{ width: 180 }}>Formulario</th>
                      <th>Respuestas Principales</th>
                      <th style={{ width: 130 }}>Etiquetas</th>
                      <th style={{ width: 120 }}>Estado</th>
                      <th style={{ width: 140 }}>Fecha de Envío</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => {
                      const formName = forms.find(f => f.id === sub.formId)?.name || "Formulario";
                      
                      // Combine first 2 properties as preview
                      const entries = Object.entries(sub.data).slice(0, 2);
                      const previewText = entries.map(([key, val]) => `${key}: ${val}`).join(" | ");

                      return (
                        <tr key={sub.id} onClick={() => setSelectedSubmissionId(sub.id)}>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>{sub.id}</td>
                          <td style={{ fontWeight: 600 }}>{formName}</td>
                          <td style={{ color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 300 }}>
                            {previewText}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                              {sub.tags.map(t => (
                                <span key={t} className="tag-pill">{t}</span>
                              ))}
                              {sub.tags.length === 0 && <span style={{ color: "var(--text-disabled)", fontSize: 11 }}>—</span>}
                            </div>
                          </td>
                          <td>
                            <span className={`status-badge status-${sub.status}`}>
                              {sub.status}
                            </span>
                          </td>
                          <td style={{ color: "var(--text-tertiary)", fontSize: 12 }}>
                            {new Date(sub.created_at).toLocaleString("es-CR", { dateStyle: "short", timeStyle: "short" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 48, textAlign: "center", color: "var(--text-tertiary)" }}>
                  No se encontraron envíos que coincidan con los filtros aplicados.
                </div>
              )}
            </div>

            {/* Slide-out Drawer Overlay */}
            <div 
              className={`drawer-overlay ${activeSubmission ? "open" : ""}`} 
              onClick={() => setSelectedSubmissionId(null)}
            />

            {/* Slide-out Detail Drawer */}
            <div className={`detail-drawer ${activeSubmission ? "open" : ""}`}>
              {activeSubmission && (
                <>
                  <div className="drawer-header">
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 15 }}>{activeSubmission.id}</span>
                        <span className={`status-badge status-${activeSubmission.status}`}>
                          {activeSubmission.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                        Enviado el {new Date(activeSubmission.created_at).toLocaleString("es-CR", { dateStyle: "long", timeStyle: "short" })}
                      </div>
                    </div>
                    <button className="btn-field-action" onClick={() => setSelectedSubmissionId(null)}>
                      <i className="ti ti-x" style={{ fontSize: 18 }} />
                    </button>
                  </div>

                  <div className="drawer-body">
                    {/* Pipeline Controls */}
                    <div className="drawer-section">
                      <div className="drawer-section-title">Control de Flujo (Estado)</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { val: "pending", label: "Pendiente" },
                          { val: "reviewed", label: "Revisado" },
                          { val: "approved", label: "Aprobado" },
                          { val: "rejected", label: "Rechazado" }
                        ].map((btn) => (
                          <button
                            key={btn.val}
                            className={`btn ${activeSubmission.status === btn.val ? "btn-primary" : "btn-secondary"}`}
                            style={{ flex: 1, padding: "6px 8px", fontSize: 11.5, justifyContent: "center" }}
                            onClick={() => handleStatusChange(btn.val)}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Data Fields */}
                    <div className="drawer-section">
                      <div className="drawer-section-title">Respuestas del Formulario</div>
                      <div className="drawer-grid">
                        {Object.entries(activeSubmission.data).map(([key, val]) => (
                          <div key={key} style={{ display: "contents" }}>
                            <div className="drawer-key">{key}</div>
                            <div className="drawer-val">{String(val) || <span style={{ color: "var(--text-disabled)", fontStyle: "italic" }}>Sin respuesta</span>}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags section */}
                    <div className="drawer-section">
                      <div className="drawer-section-title">Etiquetas</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                        {activeSubmission.tags.map(t => (
                          <span key={t} className="tag-pill" style={{ padding: "4px 8px", fontSize: 12 }}>
                            {t}
                            <i className="ti ti-x" style={{ marginLeft: 6, cursor: "pointer", fontSize: 10 }} onClick={() => handleRemoveTag(t)} />
                          </span>
                        ))}
                        {activeSubmission.tags.length === 0 && (
                          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontStyle: "italic" }}>Sin etiquetas.</span>
                        )}
                      </div>
                      <form onSubmit={handleAddTag} style={{ display: "flex", gap: 6 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Nueva etiqueta..."
                          style={{ padding: "6px 10px", fontSize: 12 }}
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                        <button className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12 }}>Agregar</button>
                      </form>
                    </div>

                    {/* Comments section */}
                    <div className="drawer-section">
                      <div className="drawer-section-title">Comentarios / Notas Internas</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                        {activeSubmission.comments.map((comment) => (
                          <div key={comment.id} style={{ background: "var(--bg-surface-sunken)", border: "1px solid var(--border-hairline)", padding: 10, borderRadius: 8 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 4 }}>
                              <span>{comment.author}</span>
                              <span style={{ fontWeight: 400, color: "var(--text-tertiary)" }}>
                                {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p style={{ fontSize: 12.5, color: "var(--text-primary)" }}>{comment.text}</p>
                          </div>
                        ))}
                        {activeSubmission.comments.length === 0 && (
                          <span style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>
                            No hay notas internas registradas en este envío.
                          </span>
                        )}
                      </div>
                      <form onSubmit={handleAddComment} style={{ display: "flex", gap: 6 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Escribe una nota para el equipo..."
                          style={{ padding: "8px 12px", fontSize: 12.5 }}
                          value={newCommentText}
                          onChange={(e) => setNewCommentText(e.target.value)}
                        />
                        <button className="btn btn-primary" style={{ padding: "8px 12px", fontSize: 12.5 }}>Anotar</button>
                      </form>
                    </div>

                    {/* Audit Timeline activity */}
                    <div className="drawer-section">
                      <div className="drawer-section-title">Historial de Auditoría</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 11.5, color: "var(--text-secondary)" }}>
                        {activeSubmission.activity.map((act) => (
                          <div key={act.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                            <i className="ti ti-circle-dot" style={{ color: "var(--text-disabled)", marginTop: 3, fontSize: 8 }} />
                            <div>
                              <span style={{ fontWeight: 600 }}>{act.user}: </span>
                              {act.details}
                              <span style={{ color: "var(--text-tertiary)", marginLeft: 6 }}>
                                ({new Date(act.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ============================================================
              TAB: WORKFLOWS
              ============================================================ */}
          <div className={`tab-content ${activeTab === "workflows" ? "active" : ""}`}>
            {workflows.length === 0 ? (
              <div style={{ textAlign: "center", padding: 60 }}>
                <h3>No hay flujos de trabajo configurados</h3>
                <button className="btn btn-primary" onClick={createWorkflow} style={{ marginTop: 12 }}>Crear Workflow</button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>Workflow de Automatización:</span>
                    <select 
                      className="filter-select"
                      value={selectedWorkflowId}
                      onChange={(e) => setSelectedWorkflowId(e.target.value)}
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {workflows.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={createWorkflow}>
                      <i className="ti ti-plus" /> Crear
                    </button>
                  </div>
                  <div>
                    <label className="option-label" style={{ fontWeight: 700 }}>
                      <input 
                        type="checkbox"
                        checked={activeWorkflow.active}
                        onChange={(e) => {
                          const updated = workflows.map(w => w.id === activeWorkflow.id ? { ...w, active: e.target.checked } : w);
                          setWorkflows(updated);
                          saveToLocalStorage("workflows", updated);
                        }}
                      />
                      Regla Activa
                    </label>
                  </div>
                </div>

                <div className="responsive-grid-workflows">
                  
                  {/* Left Column: Visual flow builder */}
                  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 20 }}>
                      Lienzo Visual del Flujo
                    </h4>

                    <div className="workflow-canvas">
                      {activeWorkflow.nodes.map((node, nIdx) => (
                        <div key={node.id} style={{ display: "contents" }}>
                          {nIdx > 0 && <div className="flow-arrow" />}
                          <div className="workflow-node">
                            <div className={`workflow-node-icon ${node.type === "trigger" ? "node-trigger" : node.type === "condition" ? "node-condition" : "node-action"}`}>
                              <i className={`ti ${node.type === "trigger" ? "ti-cloud-upload" : node.type === "condition" ? "ti-git-fork" : "ti-bolt"}`} />
                            </div>
                            <div className="workflow-node-info">
                              <div className="workflow-node-label">{node.label}</div>
                              <div className="workflow-node-desc" title={node.details}>{node.details}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "center" }}>
                      <span style={{ fontSize: 13, alignSelf: "center", fontWeight: 600, color: "var(--text-secondary)" }}>+ Agregar acción:</span>
                      <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => addWorkflowActionNode("approve")}>
                        Cambiar Estado a Aprobado
                      </button>
                      <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => addWorkflowActionNode("webhook")}>
                        Invocar Webhook HTTP
                      </button>
                      <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => addWorkflowActionNode("email")}>
                        Enviar Correo Alerta
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Execution logs console */}
                  <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                      Bitácora de Ejecución (Logs)
                    </h4>
                    <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 12 }}>Historial de ejecuciones automáticas disparadas por form submissions:</p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {executions.filter(ex => ex.workflowId === activeWorkflow.id).length > 0 ? (
                        executions.filter(ex => ex.workflowId === activeWorkflow.id).map((run) => (
                          <div 
                            key={run.id}
                            style={{ 
                              border: "1px solid var(--border-soft)", 
                              borderRadius: 8, 
                              padding: 12, 
                              cursor: "pointer", 
                              background: activeLogId === run.id ? "var(--bg-surface-raised)" : "var(--bg-surface)",
                              borderColor: activeLogId === run.id ? "var(--text-primary)" : "var(--border-soft)"
                            }}
                            onClick={() => setActiveLogId(run.id)}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <span style={{ fontWeight: 700, fontSize: 12.5, fontFamily: "var(--font-mono)" }}>RUN #{run.id}</span>
                              <span style={{ fontSize: 11, fontWeight: 700, color: run.status === "success" ? "#16a34a" : "#dc2626", background: run.status === "success" ? "#dcfce7" : "#fee2e2", padding: "2px 6px", borderRadius: 4 }}>
                                {run.status.toUpperCase()}
                              </span>
                            </div>
                            <div style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginTop: 6 }}>
                              Cargado por Envío {run.submissionId} | {new Date(run.created_at).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: 12.5, color: "var(--text-tertiary)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
                          No hay logs de ejecución aún para este flujo.
                        </div>
                      )}
                    </div>

                    {/* Console statement outputs */}
                    {activeLogId && (
                      (() => {
                        const log = executions.find(e => e.id === activeLogId);
                        if (!log) return null;
                        return (
                          <div className="workflow-logs-container" style={{ padding: 0, border: "none", boxShadow: "none" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginTop: 14 }}>Salida de Consola (Detalles)</div>
                            <div className="console-logs">
                              {log.logs.map((str, idx) => (
                                <div key={idx}>{str}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ============================================================
              TAB: ANALYTICS
              ============================================================ */}
          <div className={`tab-content ${activeTab === "analytics" ? "active" : ""}`}>
            <div className="responsive-grid-metrics" style={{ marginBottom: 24 }}>
              <div className="metric-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-disabled)" }}>Total de vistas</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{totalViews}</div>
              </div>
              <div className="metric-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-disabled)" }}>Envíos Completados</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{totalSubmissions}</div>
              </div>
              <div className="metric-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-disabled)" }}>Tasa de Conversión</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>{overallConversion}%</div>
              </div>
              <div className="metric-card" style={{ marginBottom: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--text-disabled)" }}>Tiempo Promedio de Completado</div>
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 4 }}>48 segs</div>
              </div>
            </div>

            <div className="analytics-grid">
              {/* CSS Bar Chart for Vistas vs Envios */}
              <div className="analytics-chart-card">
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10 }}>
                  Estadísticas de Tráfico &amp; Conversiones por Formulario
                </h4>
                
                <div className="bar-chart-container">
                  {forms.map((form) => {
                    const formViews = form.views || 0;
                    const formSubs = submissions.filter(s => s.formId === form.id).length;
                    const percent = formViews > 0 ? Math.round((formSubs / formViews) * 100) : 0;

                    // Chart scaling relative to max view count
                    const maxCount = Math.max(...forms.map(f => f.views), 1);
                    const viewWidth = Math.round((formViews / maxCount) * 100);
                    const subWidth = Math.round((formSubs / maxCount) * 100);

                    return (
                      <div key={form.id} className="bar-chart-row">
                        <div className="bar-chart-info">
                          <span>{form.name}</span>
                          <span style={{ color: "var(--text-secondary)" }}>{formSubs} envíos / {formViews} vistas ({percent}%)</span>
                        </div>
                        <div className="bar-chart-track">
                          {/* Views bar */}
                          <div className="bar-chart-fill-views" style={{ width: `${viewWidth}%` }} />
                          {/* Submissions bar */}
                          <div className="bar-chart-fill-subs" style={{ width: `${subWidth}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {forms.length === 0 && (
                    <div style={{ textAlign: "center", padding: 24, color: "var(--text-tertiary)" }}>No hay formularios con datos.</div>
                  )}
                </div>
              </div>

              {/* Conversion Funnel drop-offs representation */}
              <div className="analytics-chart-card">
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                  Embudo de Conversión (General)
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { step: "1. Vistas al Enlace", count: totalViews, pct: 100 },
                    { step: "2. Formulario Iniciado", count: Math.round(totalViews * 0.85), pct: 85 },
                    { step: "3. Datos Rellenados", count: Math.round(totalViews * 0.76), pct: 76 },
                    { step: "4. Envíos Guardados", count: totalSubmissions, pct: overallConversion }
                  ].map((stage, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 600, marginBottom: 4 }}>
                        <span>{stage.step}</span>
                        <span>{stage.count} ({stage.pct}%)</span>
                      </div>
                      <div style={{ height: 10, background: "var(--bg-surface-sunken)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", background: "#4338ca", width: `${stage.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================
              TAB: SETTINGS (Workspace, API Keys & Team Collaboration)
              ============================================================ */}
          <div className={`tab-content ${activeTab === "settings" ? "active" : ""}`}>
            <div className="responsive-grid-settings">
              
              {/* Workspace Config Form */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                  Ajustes del Workspace
                </h4>

                <form onSubmit={handleWorkspaceSettingsSave} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="form-group">
                    <label>Nombre del Workspace</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={workspaceName} 
                      onChange={(e) => setWorkspaceName(e.target.value)} 
                    />
                  </div>

                  <div className="form-group">
                    <label>Límite de solicitudes API (requests/min)</label>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <input 
                        type="range" 
                        min="60" 
                        max="600" 
                        step="20"
                        style={{ flex: 1, accentColor: "#1A1A1A" }}
                        value={rateLimit} 
                        onChange={(e) => setRateLimit(Number(e.target.value))} 
                      />
                      <span style={{ fontSize: 13, fontFamily: "var(--font-mono)", fontWeight: 700, width: 60, textAlign: "right" }}>{rateLimit}/m</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="option-label">
                      <input 
                        type="checkbox" 
                        checked={honeypotActive} 
                        onChange={(e) => setHoneypotActive(e.target.checked)} 
                      />
                      Habilitar Honeypot Spam Protection
                    </label>
                    <span style={{ fontSize: 11, color: "var(--text-tertiary)", marginLeft: 22 }}>Agrega un campo oculto a los formularios para capturar y descartar bots maliciosos automáticamente.</span>
                  </div>

                  <button className="btn btn-primary" style={{ alignSelf: "flex-start", marginTop: 8 }}>Guardar Configuración</button>
                </form>
              </div>

              {/* Members/Team Collaboration section */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                  Equipo &amp; Colaboración (Roles)
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {members.map((mem) => (
                    <div key={mem.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "var(--bg-surface-sunken)", borderRadius: 8, border: "1px solid var(--border-soft)" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{mem.email}</div>
                        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
                          Rol: <span style={{ textTransform: "uppercase", fontWeight: 700, fontSize: 9.5 }}>{mem.role}</span>
                        </div>
                      </div>
                      {mem.role !== "owner" && (
                        <button className="btn-field-action" style={{ color: "#ef4444" }} onClick={() => removeTeamMember(mem.id)}>
                          <i className="ti ti-trash" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <form onSubmit={inviteTeamMember} className="responsive-flex-form">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="correo@ejemplo.com"
                    style={{ flex: 1 }}
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <select
                    className="filter-select"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button className="btn btn-primary">Invitar</button>
                </form>
              </div>

              {/* API Keys section */}
              <div className="settings-span-2" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                  Claves de API de Acceso (Credentials)
                </h4>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginBottom: 16 }}>Utiliza estas credenciales para consumir la API de Kovira (/forms, /submissions, /workflows) desde tus backends:</p>

                <div className="spreadsheet-container" style={{ marginBottom: 20 }}>
                  <table className="spreadsheet-table">
                    <thead>
                      <tr>
                        <th>Nombre de Credencial</th>
                        <th>Clave API</th>
                        <th>Creado en</th>
                        <th>Estado</th>
                        <th style={{ width: 80 }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {apiKeys.map((k) => (
                        <tr key={k.id} style={{ cursor: "default" }}>
                          <td style={{ fontWeight: 600 }}>{k.name}</td>
                          <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5 }}>
                            {k.key.substring(0, 16)}...
                          </td>
                          <td style={{ color: "var(--text-tertiary)" }}>{new Date(k.created_at).toLocaleDateString()}</td>
                          <td>
                            <span className={`status-badge ${k.status === "active" ? "status-approved" : "status-rejected"}`}>
                              {k.status === "active" ? "Activo" : "Revocado"}
                            </span>
                          </td>
                          <td>
                            {k.status === "active" ? (
                              <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 11, color: "#ef4444" }} onClick={() => revokeAPIKey(k.id)}>
                                Revocar
                              </button>
                            ) : (
                              <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Desactivado</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <form onSubmit={generateNewAPIKey} className="responsive-flex-form" style={{ maxWidth: 500 }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Nombre de la nueva Clave</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ej. Servidor Móvil"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary" style={{ padding: "10px 16px" }}>Generar Clave</button>
                </form>

                {generatedKey && (
                  <div style={{ marginTop: 14, background: "#fef3c7", border: "1px solid #fde68a", padding: 12, borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#92400e" }}>CLAVE GENERADA CON ÉXITO (Cópiala ahora, no volverá a mostrarse):</div>
                      <code style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{generatedKey}</code>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: "6px 12px", fontSize: 11 }}
                      onClick={() => {
                        navigator.clipboard.writeText(generatedKey);
                        alert("Clave API copiada!");
                      }}
                    >
                      Copiar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
        </div> {/* workspace-panel */}
      </main>

      {/* ============================================================
          MODAL: FORM PREVIEW / SIMULATOR
          ============================================================ */}
      {isPreviewOpen && activeForm && (
        <div className="preview-overlay-fullscreen">
          {/* Header */}
          <div className="preview-typeform-header">
            <div className="preview-typeform-header-title">
              <div className="preview-header-logo" style={{ color: 'var(--color-ink)', display: 'flex', alignItems: 'center' }}>
                <svg className="w-[22px] h-[22px] shrink-0" viewBox="0 0 44 45" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M22.2782 6.3584C23.3828 6.3584 24.2782 7.25383 24.2782 8.3584V15.4716C24.3202 15.4824 24.3621 15.4936 24.4038 15.5052L28.96 7.61365L30.3071 8.39141C31.2636 8.94371 31.5914 10.1669 31.0391 11.1235L27.4822 17.2841C27.5129 17.3142 27.5433 17.3446 27.5734 17.3752L35.4668 12.818L36.2446 14.1652C36.7969 15.1218 36.4691 16.3449 35.5125 16.8972L29.3536 20.4531C29.3654 20.4956 29.3768 20.5382 29.3878 20.5811H38.5V22.1366C38.5 23.2412 37.6046 24.1366 36.5 24.1366H29.3878C29.377 24.1787 29.3658 24.2207 29.3542 24.2625L37.2446 28.818L36.4668 30.1652C35.9145 31.1218 34.6913 31.4495 33.7347 30.8973L27.5748 27.3409C27.5446 27.3717 27.5141 27.4022 27.4833 27.4324L32.0401 35.325L30.6931 36.1028C29.7365 36.6551 28.5133 36.3273 27.961 35.3708L24.4052 29.212C24.363 29.2237 24.3207 29.235 24.2782 29.2459V38.3584H22.7227C21.6181 38.3584 20.7227 37.463 20.7227 36.3584V29.2458C20.6802 29.2349 20.6379 29.2235 20.5958 29.2119L16.0392 37.1042L14.692 36.3264C13.7354 35.7742 13.4077 34.551 13.96 33.5944L17.5178 27.432C17.4868 27.4016 17.456 27.3708 17.4256 27.3398L9.53168 31.8973L8.75387 30.55C8.2016 29.5934 8.52936 28.3703 9.48594 27.818L15.6469 24.261C15.6355 24.2197 15.6244 24.1782 15.6137 24.1366H6.5V22.5811C6.5 21.4765 7.39543 20.5811 8.5 20.5811H15.6137C15.6246 20.5388 15.6358 20.4966 15.6475 20.4546L7.75391 15.8972L8.53169 14.5501C9.08397 13.5935 10.3071 13.2657 11.2637 13.818L17.427 17.3763C17.4573 17.3455 17.4879 17.3148 17.5188 17.2845L12.9609 9.39008L14.3081 8.61231C15.2647 8.06002 16.4879 8.38777 17.0401 9.34436L20.5972 15.5053C20.6388 15.4938 20.6807 15.4826 20.7227 15.4718V6.3584H22.2782ZM25.647 24.0166L25.5129 24.2489C25.2237 24.7087 24.8322 25.0977 24.3703 25.3838L24.1802 25.4935C23.6947 25.7542 23.1416 25.9053 22.554 25.914H22.4475C20.5083 25.8855 18.9452 24.3047 18.9452 22.3588C18.9452 20.3951 20.537 18.8032 22.5008 18.8032C23.1125 18.8032 23.6882 18.9577 24.1909 19.2298L24.3599 19.3274C24.8366 19.6204 25.239 20.0227 25.532 20.4994L25.6299 20.669C25.8909 21.1513 26.0436 21.7007 26.0556 22.2847V22.4329C26.0439 23.0041 25.8975 23.5421 25.647 24.0166Z" fill="currentColor"/>
                </svg>
              </div>
              <div style={{ width: '1px', height: '16px', background: 'var(--color-soft-mist)', margin: '0 8px' }}></div>
              <span className="preview-badge-live">VISTA PREVIA</span>
              <h4 style={{ fontWeight: 600, margin: 0, fontSize: "14px", letterSpacing: "-0.02em" }}>{activeForm.name}</h4>
            </div>
            <button className="preview-close-btn" onClick={() => setIsPreviewOpen(false)} title="Salir de vista previa">
              <span style={{ fontSize: "13px", fontWeight: 500, marginRight: "4px" }}>Cerrar</span>
              <Icon name="x" size={14} />
            </button>
          </div>

          {/* Centered Body */}
          <div className="preview-typeform-container">
            {!showThankYou ? (
              <div className="preview-typeform-content-card">
                {(() => {
                  const visibleFields = getVisibleFields();
                  if (visibleFields.length === 0) {
                    return (
                      <div className="preview-empty-state">
                        <Icon name="eye" size={24} style={{ color: "var(--color-slate)", marginBottom: 12 }} />
                        <p>No hay preguntas visibles en este momento.</p>
                        <span style={{ fontSize: 12, color: "var(--color-ash)" }}>Agrega campos al formulario o ajusta las reglas de visibilidad.</span>
                      </div>
                    );
                  }

                  const currentField = visibleFields[currentStepIdx];
                  if (!currentField) return null;

                  const stepNum = String(currentStepIdx + 1).padStart(2, '0');
                  const totalSteps = String(visibleFields.length).padStart(2, '0');

                  return (
                    <div className="preview-step-slide" key={currentField.id}>
                      {/* Notion icon bar */}
                      <div style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}>
                        <div className="notion-style-question-icon" style={{ marginBottom: 0 }}>
                          <Icon name={`${currentField.type}-icon`} size={18} />
                        </div>
                      </div>

                      {/* Step Header */}
                      <div className="preview-step-header">
                        <label className="preview-step-label">
                          {currentField.label}
                          {currentField.required && <span style={{ color: "#ef4444", marginLeft: 4 }}>*</span>}
                        </label>
                        {stepError && (
                          <span className="notion-validation-text">
                            <Icon name="alert-circle" size={12} style={{ color: "#ef4444", marginRight: 4 }} />
                            <span>Obligatorio</span>
                          </span>
                        )}
                      </div>

                      {/* Helper description/placeholder if present */}
                      {currentField.placeholder && currentField.type !== "text" && currentField.type !== "email" && currentField.type !== "number" && (
                        <p className="preview-step-desc">{currentField.placeholder}</p>
                      )}

                      {/* Inputs depending on field type */}
                      <div className="preview-step-input-wrap">
                        {currentField.type === "text" && (
                          <input 
                            type="text" 
                            className={`typeform-text-input ${stepError ? "error" : ""}`} 
                            placeholder={currentField.placeholder || "Escribe tu respuesta aquí..."}
                            required={currentField.required}
                            value={previewAnswers[currentField.label] || ""}
                            onChange={(e) => {
                              setPreviewAnswers({ ...previewAnswers, [currentField.label]: e.target.value });
                              setStepError(false);
                            }}
                            autoFocus
                          />
                        )}

                        {currentField.type === "email" && (
                          <input 
                            type="email" 
                            className={`typeform-text-input ${stepError ? "error" : ""}`} 
                            placeholder={currentField.placeholder || "ejemplo@correo.com"}
                            required={currentField.required}
                            value={previewAnswers[currentField.label] || ""}
                            onChange={(e) => {
                              setPreviewAnswers({ ...previewAnswers, [currentField.label]: e.target.value });
                              setStepError(false);
                            }}
                            autoFocus
                          />
                        )}

                        {currentField.type === "number" && (
                          <input 
                            type="number" 
                            className={`typeform-text-input ${stepError ? "error" : ""}`} 
                            placeholder={currentField.placeholder || "Escribe un número..."}
                            required={currentField.required}
                            value={previewAnswers[currentField.label] || ""}
                            onChange={(e) => {
                              setPreviewAnswers({ ...previewAnswers, [currentField.label]: e.target.value });
                              setStepError(false);
                            }}
                            autoFocus
                          />
                        )}

                        {currentField.type === "select" && (
                          <div className="monograph-select-wrap">
                            <button
                              type="button"
                              className={`monograph-select-trigger ${isSelectDropdownOpen ? 'active' : ''} ${stepError ? 'error' : ''}`}
                              onClick={() => setIsSelectDropdownOpen(!isSelectDropdownOpen)}
                            >
                              <span className="select-trigger-text">
                                {previewAnswers[currentField.label] || "Selecciona una opción..."}
                              </span>
                              <div className="monograph-select-arrow">
                                <Icon name="chevron-down" size={16} />
                              </div>
                            </button>

                            {isSelectDropdownOpen && (
                              <div className="monograph-select-dropdown">
                                {(currentField.options || []).map((opt) => {
                                  const isSelected = previewAnswers[currentField.label] === opt;
                                  return (
                                    <div
                                      key={opt}
                                      className={`monograph-select-option-row ${isSelected ? 'selected' : ''}`}
                                      onClick={() => {
                                        setPreviewAnswers({ ...previewAnswers, [currentField.label]: opt });
                                        setStepError(false);
                                        setIsSelectDropdownOpen(false);
                                      }}
                                    >
                                      <span className="select-option-text">{opt}</span>
                                      {isSelected && (
                                        <span className="select-option-check">
                                          <Icon name="check" size={12} />
                                        </span>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

                        {currentField.type === "radio" && (
                          <div className={`monograph-choices-list ${stepError ? 'error' : ''}`}>
                            {(currentField.options || []).map((opt, oIdx) => {
                              const isSelected = previewAnswers[currentField.label] === opt;
                              return (
                                <div 
                                  key={opt} 
                                  className={`monograph-choice-row ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    setPreviewAnswers({ ...previewAnswers, [currentField.label]: opt });
                                    setStepError(false);
                                    setTimeout(() => {
                                      handleNextStep();
                                    }, 300);
                                  }}
                                >
                                  <span className="monograph-choice-index">[{oIdx + 1}]</span>
                                  <span className="monograph-choice-text">{opt}</span>
                                  {isSelected && (
                                    <span className="monograph-choice-check">
                                      <Icon name="check" size={12} />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {currentField.type === "checkbox" && (
                          <div className={`monograph-choices-list ${stepError ? 'error' : ''}`}>
                            {(currentField.options || []).map((opt, oIdx) => {
                              const currentList = Array.isArray(previewAnswers[currentField.label]) ? previewAnswers[currentField.label] : [];
                              const isSelected = currentList.includes(opt);
                              return (
                                <div 
                                  key={opt} 
                                  className={`monograph-choice-row ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    const nextList = isSelected 
                                      ? currentList.filter(v => v !== opt)
                                      : [...currentList, opt];
                                    setPreviewAnswers({ ...previewAnswers, [currentField.label]: nextList });
                                    setStepError(false);
                                  }}
                                >
                                  <span className="monograph-choice-index">[{oIdx + 1}]</span>
                                  <span className="monograph-choice-text">{opt}</span>
                                  {isSelected && (
                                    <span className="monograph-choice-check">
                                      <Icon name="check" size={12} />
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {currentField.type === "date" && (
                          <input 
                            type="date" 
                            className={`typeform-text-input ${stepError ? "error" : ""}`} 
                            required={currentField.required}
                            value={previewAnswers[currentField.label] || ""}
                            onChange={(e) => {
                              setPreviewAnswers({ ...previewAnswers, [currentField.label]: e.target.value });
                              setStepError(false);
                            }}
                            autoFocus
                          />
                        )}

                        {currentField.type === "file" && (
                          <div className="typeform-file-upload-wrap">
                            <input 
                              type="file" 
                              id={`preview-file-${currentField.id}`}
                              className="typeform-file-input"
                              required={currentField.required}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setPreviewAnswers({ ...previewAnswers, [currentField.label]: file ? file.name : "" });
                                setStepError(false);
                              }}
                            />
                            <label htmlFor={`preview-file-${currentField.id}`} className={`typeform-file-label ${stepError ? 'error' : ''}`}>
                              <Icon name="file-icon" size={16} style={{ marginRight: 8 }} />
                              <span>{previewAnswers[currentField.label] || "Subir un archivo (Máx. 10MB)"}</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Enter prompt */}
                      {currentField.type !== "checkbox" && (
                        <div className="typeform-enter-prompt">
                          <span>Presiona</span>
                          <kbd className="typeform-kbd">Enter</kbd>
                          <span>o haz clic en Avanzar</span>
                          <Icon name="corner-down-left" size={12} style={{ marginLeft: 4, opacity: 0.6 }} />
                        </div>
                      )}
                      {currentField.type === "checkbox" && (
                        <div className="typeform-enter-prompt">
                          <span>Selecciona las opciones que desees y avanza</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              /* Success / Thank You screen */
              <div className="preview-typeform-thankyou">
                <div className="typeform-thankyou-icon">
                  <Icon name="check" size={20} style={{ color: "var(--color-pure-paper)" }} />
                </div>
                <h3 className="typeform-thankyou-title">¡Envío exitoso!</h3>
                <p className="typeform-thankyou-text">
                  {activeForm.thankYouText || "Tus datos han sido registrados correctamente en el sistema de base de datos local."}
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                  <button className="typeform-btn-secondary" onClick={openFormPreview}>
                    Responder otra vez
                  </button>
                  <button className="typeform-btn-primary" onClick={() => setIsPreviewOpen(false)}>
                    Cerrar Simulador
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation & Progress bar */}
          {!showThankYou && (
            <div className="preview-typeform-nav-bar">
              {(() => {
                const visibleFields = getVisibleFields();
                if (visibleFields.length === 0) return null;
                
                const percent = Math.round((currentStepIdx / visibleFields.length) * 100);
                const isLast = currentStepIdx === visibleFields.length - 1;

                return (
                  <>
                    <div className="typeform-progress-wrap">
                      <div className="typeform-progress-text">
                        <span>Pregunta {currentStepIdx + 1} de {visibleFields.length}</span>
                        <span className="typeform-progress-percent">{percent}% completado</span>
                      </div>
                      <div className="typeform-progress-track">
                        <div className="typeform-progress-bar" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>

                    <div className="typeform-nav-buttons">
                      <button 
                        type="button" 
                        className="typeform-nav-btn" 
                        onClick={handlePrevStep}
                        disabled={currentStepIdx === 0}
                        title="Pregunta anterior"
                      >
                        <Icon name="arrow-up" size={16} />
                        <span className="hide-on-mobile" style={{ marginLeft: 6 }}>Volver</span>
                      </button>
                      
                      <button 
                        type="button" 
                        className="typeform-nav-btn primary" 
                        onClick={handleNextStep}
                        title={isLast ? "Enviar formulario" : "Siguiente pregunta"}
                      >
                        {isLast ? (
                          <>
                            <span style={{ marginRight: 6 }}>Enviar</span>
                            <Icon name="check" size={14} />
                          </>
                        ) : (
                          <>
                            <span className="hide-on-mobile" style={{ marginRight: 6 }}>Avanzar</span>
                            <Icon name="arrow-down" size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

