"use client";

import { useState, useEffect, useMemo } from "react";

export default function SaaSApp() {
  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeWorkspace, setActiveWorkspace] = useState("personal");
  const [isMounted, setIsMounted] = useState(false);

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

  // 1. Initial mounting check to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    setIsPreviewOpen(true);
  };

  const handlePreviewSubmit = (e) => {
    e.preventDefault();
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
      author: "Kirian Luna",
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
      user: "Kirian Luna",
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
    <div className="app-shell">
      {/* ============================================================
          SIDEBAR NAVIGATION (03-ui-architecture.md)
          ============================================================ */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <div style={{ width: 18, height: 18, borderRadius: 4, background: "#1A1A1A", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFF", fontSize: 9, fontWeight: 800 }}>K</div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Workspace Selector Dropdown */}
            <select 
              value={activeWorkspace} 
              onChange={(e) => {
                setActiveWorkspace(e.target.value);
                setActiveTab("dashboard");
              }}
              style={{ width: "100%", border: "none", background: "none", fontSize: "14px", fontWeight: "700", color: "var(--text-primary)", cursor: "pointer", outline: "none" }}
            >
              <option value="personal">Mi Workspace</option>
              <option value="acme">Acme Corp</option>
            </select>
            <div style={{ fontSize: 10, color: "var(--text-tertiary)", paddingLeft: 2 }}>{workspaceName}</div>
          </div>
        </div>

        <div className="sidebar-divider" />

        {/* 03-ui-architecture.md Layout links */}
        <div className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`} onClick={() => setActiveTab("dashboard")}>
          <div className="nav-icon"><i className="ti ti-layout-dashboard" /></div>
          Dashboard
        </div>
        <div className={`nav-item ${activeTab === "form-builder" ? "active" : ""}`} onClick={() => setActiveTab("form-builder")}>
          <div className="nav-icon"><i className="ti ti-edit" /></div>
          Form Builder
        </div>
        <div className={`nav-item ${activeTab === "submissions" ? "active" : ""}`} onClick={() => setActiveTab("submissions")}>
          <div className="nav-icon"><i className="ti ti-database-import" /></div>
          Submissions
          {submissions.filter(s => s.status === "pending").length > 0 && (
            <span style={{ marginLeft: "auto", background: "#ef4444", color: "#fff", fontSize: 9, padding: "2px 6px", borderRadius: 99, fontWeight: 700 }}>
              {submissions.filter(s => s.status === "pending").length}
            </span>
          )}
        </div>
        <div className={`nav-item ${activeTab === "workflows" ? "active" : ""}`} onClick={() => setActiveTab("workflows")}>
          <div className="nav-icon"><i className="ti ti-git-branch" /></div>
          Workflows
        </div>
        <div className={`nav-item ${activeTab === "analytics" ? "active" : ""}`} onClick={() => setActiveTab("analytics")}>
          <div className="nav-icon"><i className="ti ti-chart-bar" /></div>
          Analytics
        </div>

        <div className="sidebar-divider" />
        <div className="nav-section-label">Configuración</div>

        <div className={`nav-item ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          <div className="nav-icon"><i className="ti ti-settings" /></div>
          Workspace &amp; API
        </div>

        {/* User profile card */}
        <div className="sidebar-bottom">
          <div className="profile-card">
            <div className="avatar">KL</div>
            <div style={{ minWidth: 0 }}>
              <div className="profile-name" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Kirian Luna</div>
              <div className="profile-role" style={{ fontSize: 10 }}>Sorin Labs · Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ============================================================
          MAIN WORKSPACE
          ============================================================ */}
      <main className="main">
        {/* Topbar with breadcrumb & actions */}
        <header className="topbar">
          <div className="breadcrumb" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span>Workspaces</span> 
            <i className="ti ti-chevron-right" style={{ fontSize: 10 }} /> 
            <span>{workspaceName}</span> 
            <i className="ti ti-chevron-right" style={{ fontSize: 10 }} /> 
            <b style={{ textTransform: "capitalize" }}>{activeTab.replace("-", " ")}</b>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <a href="/" target="_blank" className="btn btn-secondary" style={{ padding: "6px 10px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}>
              <i className="ti ti-external-link" /> Ver Landing Page
            </a>
            <button className="btn btn-secondary" style={{ padding: "6px 10px" }} onClick={() => alert("No tienes notificaciones pendientes.")}>
              <i className="ti ti-bell" />
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
                  <div className="metric-icon" style={{ borderColor: "#6366f1" }}><i className="ti ti-forms" style={{ color: "#6366f1" }} /></div>
                  Total Forms
                </div>
                <div className="metric-val">{forms.length}</div>
                <div className="metric-delta" style={{ color: "var(--text-tertiary)" }}>Creados en workspace</div>
              </div>

              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon" style={{ borderColor: "#22c55e" }}><i className="ti ti-database" style={{ color: "#22c55e" }} /></div>
                  Submissions
                </div>
                <div className="metric-val">{submissions.length}</div>
                <div className="metric-delta" style={{ color: "#22c55e" }}>
                  <i className="ti ti-trending-up" /> +{submissions.length} totales
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon" style={{ borderColor: "#f59e0b" }}><i className="ti ti-git-branch" style={{ color: "#f59e0b" }} /></div>
                  Workflows
                </div>
                <div className="metric-val">{workflows.filter(w => w.active).length}</div>
                <div className="metric-delta" style={{ color: "#f59e0b" }}>
                  Activos e instrumentados
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-head">
                  <div className="metric-icon" style={{ borderColor: "#3b82f6" }}><i className="ti ti-chart-pie" style={{ color: "#3b82f6" }} /></div>
                  Conversión
                </div>
                <div className="metric-val">{overallConversion}%</div>
                <div className="metric-delta" style={{ color: "var(--text-tertiary)" }}>De vistas a registros</div>
              </div>
            </div>

            {/* Layout grid for activity and actions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: 20, marginTop: 24 }}>
              {/* Quick Actions (03-ui-architecture.md) */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 10, marginBottom: 16 }}>
                  Acciones Rápidas
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <button className="btn btn-primary" style={{ justifyContent: "center" }} onClick={createNewForm}>
                    <i className="ti ti-plus" /> Crear Nuevo Formulario
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: "center" }} onClick={() => setActiveTab("submissions")}>
                    <i className="ti ti-database" /> Examinar Envíos
                  </button>
                  <button className="btn btn-secondary" style={{ justifyContent: "center" }} onClick={createWorkflow}>
                    <i className="ti ti-git-fork" /> Configurar Automatización
                  </button>
                </div>
                <div className="sidebar-divider" style={{ margin: "20px -20px" }} />
                <div>
                  <h5 style={{ fontSize: 12, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 8 }}>Formulario Activo</h5>
                  {activeForm ? (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{activeForm.name}</span>
                      <button className="btn btn-secondary" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setActiveTab("form-builder")}>Editar</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>No hay formularios activos.</span>
                  )}
                </div>
              </div>

              {/* Activity Feed */}
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", boxShadow: "var(--shadow-card)" }}>
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-secondary)" }}>Formulario:</span>
                    <select 
                      className="filter-select"
                      value={selectedFormId || ""}
                      onChange={(e) => {
                        setSelectedFormId(e.target.value);
                        setSelectedFieldId(null);
                      }}
                      style={{ fontSize: 14, fontWeight: 600 }}
                    >
                      {forms.map(f => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                    <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={createNewForm}>
                      <i className="ti ti-plus" /> Nuevo
                    </button>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-secondary" onClick={openFormPreview} style={{ background: "#4338ca", color: "#FFF" }}>
                      <i className="ti ti-player-play" /> Probar Formulario
                    </button>
                    <button className="btn btn-secondary btn-danger" onClick={deleteCurrentForm}>
                      <i className="ti ti-trash" /> Eliminar Formulario
                    </button>
                  </div>
                </div>

                {/* 3-Panel Layout (03-ui-architecture.md) */}
                <div className="builder-layout">
                  
                  {/* Left panel: components list */}
                  <div className="builder-panel">
                    <div className="builder-panel-title">Elementos</div>
                    <div className="builder-sub" style={{ fontSize: 11.5, margin: "0 0 10px 0" }}>Haz clic en un componente para agregarlo al formulario:</div>
                    <div className="field-chip-list">
                      {[
                        { type: "text", label: "Texto Corto", icon: "ti-text-size" },
                        { type: "email", label: "Correo Electrónico", icon: "ti-mail" },
                        { type: "number", label: "Número", icon: "ti-hash" },
                        { type: "select", label: "Lista Desplegable", icon: "ti-select" },
                        { type: "checkbox", label: "Opción Múltiple", icon: "ti-checkbox" },
                        { type: "radio", label: "Opción Única", icon: "ti-circle-dot" },
                        { type: "date", label: "Selector Fecha", icon: "ti-calendar" },
                        { type: "file", label: "Subir Archivo", icon: "ti-upload" }
                      ].map((item) => (
                        <div key={item.type} className="field-chip" onClick={() => addFieldToForm(item.type)}>
                          <i className={`ti ${item.icon}`} />
                          {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center panel: builder canvas */}
                  <div className="builder-canvas">
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

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {activeForm.fields.map((field, idx) => (
                        <div 
                          key={field.id} 
                          className={`canvas-field ${selectedFieldId === field.id ? "selected" : ""}`}
                          onClick={() => setSelectedFieldId(field.id)}
                        >
                          <div className="canvas-field-drag"><i className="ti ti-menu-order" /></div>
                          <div className="canvas-field-info">
                            <div className="canvas-field-label">
                              {field.label || `Campo ${field.type}`}
                              {field.required && <span className="canvas-field-required">*</span>}
                            </div>
                            <div className="canvas-field-placeholder">
                              Tipo: {field.type} {field.placeholder ? `| Placeholder: "${field.placeholder}"` : ""}
                            </div>
                            {field.condition && field.condition.fieldId && (
                              <div className="condition-badge">
                                <i className="ti ti-git-fork" /> Mostrar si target es "{field.condition.equalsValue}"
                              </div>
                            )}
                          </div>
                          <div className="canvas-field-actions">
                            <button className="btn-field-action" title="Mover Arriba" onClick={(e) => { e.stopPropagation(); moveField(idx, -1); }} disabled={idx === 0}>
                              <i className="ti ti-arrow-up" />
                            </button>
                            <button className="btn-field-action" title="Mover Abajo" onClick={(e) => { e.stopPropagation(); moveField(idx, 1); }} disabled={idx === activeForm.fields.length - 1}>
                              <i className="ti ti-arrow-down" />
                            </button>
                            <button className="btn-field-action" title="Duplicar" onClick={(e) => { e.stopPropagation(); duplicateField(field); }}>
                              <i className="ti ti-copy" />
                            </button>
                            <button className="btn-field-action" title="Eliminar" style={{ color: "#ef4444" }} onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}>
                              <i className="ti ti-trash" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {activeForm.fields.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-tertiary)", fontSize: 13 }}>
                          El formulario está vacío. Haz clic en los elementos de la izquierda para agregar campos.
                        </div>
                      )}
                    </div>

                    {/* Form settings options embedded in canvas footer */}
                    <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-soft)", borderRadius: "var(--radius-lg)", padding: "20px", marginTop: 24 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "var(--text-secondary)", marginBottom: 14, borderBottom: "1px solid var(--border-hairline)", paddingBottom: 8 }}>
                        Configuraciones de Envío &amp; Apariencia
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
                        <div className="form-group" style={{ gridColumn: "span 2" }}>
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
                  <div className="builder-panel">
                    <div className="builder-panel-title">Propiedades</div>
                    {selectedFieldId ? (
                      (() => {
                        const field = activeForm.fields.find(f => f.id === selectedFieldId);
                        if (!field) return <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>Campo no encontrado.</div>;
                        return (
                          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            <div className="form-group">
                              <label>Etiqueta / Pregunta</label>
                              <input 
                                type="text" 
                                className="form-input" 
                                value={field.label} 
                                onChange={(e) => updateFieldProperty(field.id, "label", e.target.value)} 
                              />
                            </div>

                            {field.type !== "select" && field.type !== "radio" && field.type !== "checkbox" && (
                              <div className="form-group">
                                <label>Marcador de posición (Placeholder)</label>
                                <input 
                                  type="text" 
                                  className="form-input" 
                                  value={field.placeholder || ""} 
                                  onChange={(e) => updateFieldProperty(field.id, "placeholder", e.target.value)} 
                                />
                              </div>
                            )}

                            <div className="form-group">
                              <label className="option-label">
                                <input 
                                  type="checkbox" 
                                  checked={field.required || false} 
                                  onChange={(e) => updateFieldProperty(field.id, "required", e.target.checked)} 
                                />
                                Campo Requerido
                              </label>
                            </div>

                            {/* Options builder for radio, select, checkbox */}
                            {(field.type === "select" || field.type === "radio" || field.type === "checkbox") && (
                              <div className="form-group">
                                <label>Opciones de respuesta</label>
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
                                  {(field.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: "flex", gap: 6 }}>
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
                                        style={{ color: "#ef4444" }}
                                        onClick={() => {
                                          const opts = field.options.filter((_, idx) => idx !== oIdx);
                                          updateFieldProperty(field.id, "options", opts);
                                        }}
                                        disabled={(field.options || []).length <= 1}
                                      >
                                        <i className="ti ti-x" />
                                      </button>
                                    </div>
                                  ))}
                                  <button 
                                    className="btn btn-secondary" 
                                    style={{ padding: "6px", fontSize: 11, justifyContent: "center" }}
                                    onClick={() => {
                                      const opts = [...(field.options || []), `Nueva opción ${(field.options || []).length + 1}`];
                                      updateFieldProperty(field.id, "options", opts);
                                    }}
                                  >
                                    + Agregar opción
                                  </button>
                                </div>
                              </div>
                            )}

                            <div className="sidebar-divider" style={{ margin: "10px -16px" }} />
                            
                            {/* Conditional Visibility */}
                            <div className="form-group">
                              <label style={{ fontSize: 12, fontWeight: 700 }}>Lógica de Visibilidad</label>
                              <label className="option-label" style={{ fontSize: 12.5, margin: "6px 0" }}>
                                <input 
                                  type="checkbox" 
                                  checked={!!field.condition} 
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      // Find another field to link to
                                      const other = activeForm.fields.find(f => f.id !== field.id && (f.type === "select" || f.type === "radio" || f.type === "text"));
                                      updateFieldProperty(field.id, "condition", {
                                        fieldId: other ? other.id : "",
                                        equalsValue: other && other.options ? other.options[0] : "Valor"
                                      });
                                    } else {
                                      updateFieldProperty(field.id, "condition", null);
                                    }
                                  }} 
                                />
                                Aplicar regla condicional
                              </label>

                              {field.condition && (
                                <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "var(--bg-surface-sunken)", padding: 10, borderRadius: 6, border: "1px solid var(--border-soft)", marginTop: 6 }}>
                                  <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>Mostrar este campo si:</span>
                                  <select
                                    className="form-select"
                                    style={{ padding: 6, fontSize: 12 }}
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
                                  
                                  {(() => {
                                    const targetF = activeForm.fields.find(f => f.id === field.condition.fieldId);
                                    if (targetF && (targetF.type === "select" || targetF.type === "radio")) {
                                      return (
                                        <select
                                          className="form-select"
                                          style={{ padding: 6, fontSize: 12 }}
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
                                        style={{ padding: "6px 8px", fontSize: 12 }}
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
                              )}
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <div style={{ textAlign: "center", padding: "40px 10px", color: "var(--text-tertiary)", fontSize: 12.5 }}>
                        Selecciona un campo en el lienzo para ver y editar sus atributos.
                      </div>
                    )}
                  </div>
                </div>

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

                <div style={{ height: 24, width: 1, background: "var(--border-soft)", margin: "0 4px" }} />

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

                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
                  
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 24 }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              
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

                <form onSubmit={inviteTeamMember} style={{ display: "flex", gap: 8 }}>
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
              <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-hairline)", borderRadius: "var(--radius-lg)", padding: "20px", gridColumn: "span 2", boxShadow: "var(--shadow-card)" }}>
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

                <form onSubmit={generateNewAPIKey} style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 500 }}>
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
      </main>

      {/* ============================================================
          MODAL: FORM PREVIEW / SIMULATOR
          ============================================================ */}
      {isPreviewOpen && activeForm && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderTop: `6px solid ${activeForm.theme === "Sage" ? "#22c55e" : activeForm.theme === "Rose" ? "#be185d" : activeForm.theme === "Obsidian" ? "#1A1A1A" : "#4338ca"}` }}>
            <div className="modal-header">
              <div>
                <h4 style={{ fontWeight: 800 }}>Simulador: {activeForm.name}</h4>
                <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Tema del formulario: {activeForm.theme || "Predeterminado"}</span>
              </div>
              <button className="btn-field-action" onClick={() => setIsPreviewOpen(false)}>
                <i className="ti ti-x" style={{ fontSize: 18 }} />
              </button>
            </div>
            
            <div className="modal-body">
              {!showThankYou ? (
                <form onSubmit={handlePreviewSubmit} className="preview-form">
                  
                  {previewError && (
                    <div style={{ background: "#fee2e2", border: "1px solid #fecaca", color: "#dc2626", padding: 10, borderRadius: 6, fontSize: 12.5, fontWeight: 600 }}>
                      {previewError}
                    </div>
                  )}

                  {activeForm.fields.map((field) => {
                    const isVisible = checkFieldCondition(field);
                    if (!isVisible) return null;

                    return (
                      <div key={field.id} className="form-group">
                        <label>
                          {field.label}
                          {field.required && <span style={{ color: "#ef4444" }}>*</span>}
                        </label>

                        {field.type === "text" && (
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder={field.placeholder} 
                            required={field.required}
                            value={previewAnswers[field.label] || ""}
                            onChange={(e) => setPreviewAnswers({ ...previewAnswers, [field.label]: e.target.value })}
                          />
                        )}

                        {field.type === "email" && (
                          <input 
                            type="email" 
                            className="form-input" 
                            placeholder={field.placeholder} 
                            required={field.required}
                            value={previewAnswers[field.label] || ""}
                            onChange={(e) => setPreviewAnswers({ ...previewAnswers, [field.label]: e.target.value })}
                          />
                        )}

                        {field.type === "number" && (
                          <input 
                            type="number" 
                            className="form-input" 
                            placeholder={field.placeholder} 
                            required={field.required}
                            value={previewAnswers[field.label] || ""}
                            onChange={(e) => setPreviewAnswers({ ...previewAnswers, [field.label]: e.target.value })}
                          />
                        )}

                        {field.type === "select" && (
                          <select 
                            className="form-select" 
                            required={field.required}
                            value={previewAnswers[field.label] || ""}
                            onChange={(e) => setPreviewAnswers({ ...previewAnswers, [field.label]: e.target.value })}
                          >
                            <option value="">Selecciona una opción...</option>
                            {(field.options || []).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        )}

                        {field.type === "radio" && (
                          <div className="option-group">
                            {(field.options || []).map((opt) => (
                              <label key={opt} className="option-label">
                                <input 
                                  type="radio" 
                                  name={field.id} 
                                  value={opt}
                                  checked={previewAnswers[field.label] === opt}
                                  onChange={() => setPreviewAnswers({ ...previewAnswers, [field.label]: opt })}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === "checkbox" && (
                          <div className="option-group">
                            {(field.options || []).map((opt) => (
                              <label key={opt} className="option-label">
                                <input 
                                  type="checkbox" 
                                  value={opt}
                                  checked={Array.isArray(previewAnswers[field.label]) && previewAnswers[field.label].includes(opt)}
                                  onChange={(e) => {
                                    const currentList = Array.isArray(previewAnswers[field.label]) ? previewAnswers[field.label] : [];
                                    const nextList = e.target.checked 
                                      ? [...currentList, opt] 
                                      : currentList.filter(v => v !== opt);
                                    setPreviewAnswers({ ...previewAnswers, [field.label]: nextList });
                                  }}
                                />
                                {opt}
                              </label>
                            ))}
                          </div>
                        )}

                        {field.type === "date" && (
                          <input 
                            type="date" 
                            className="form-input" 
                            required={field.required}
                            value={previewAnswers[field.label] || ""}
                            onChange={(e) => setPreviewAnswers({ ...previewAnswers, [field.label]: e.target.value })}
                          />
                        )}

                        {field.type === "file" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <input 
                              type="file" 
                              className="form-input"
                              style={{ padding: "6px" }}
                              required={field.required}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                setPreviewAnswers({ ...previewAnswers, [field.label]: file ? file.name : "" });
                              }}
                            />
                            <span style={{ fontSize: 11, color: "var(--text-tertiary)" }}>Límites: Archivos de hasta 10MB</span>
                          </div>
                        )}

                      </div>
                    );
                  })}

                  <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setIsPreviewOpen(false)}>Cancelar</button>
                    <button type="submit" className="btn btn-primary" style={{ background: activeForm.theme === "Sage" ? "#22c55e" : activeForm.theme === "Rose" ? "#be185d" : activeForm.theme === "Obsidian" ? "#1A1A1A" : "#4338ca", color: "#FFF" }}>
                      Enviar Formulario
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 10px" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyCenter: "center", margin: "0 auto 16px", fontSize: 24 }}>
                    <i className="ti ti-check" style={{ margin: "auto" }} />
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>¡Envío exitoso!</h3>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                    {activeForm.thankYouText || "Tus datos han sido registrados correctamente en el sistema de base de datos local."}
                  </p>
                  <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setIsPreviewOpen(false)}>Cerrar Simulador</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

