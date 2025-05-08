import axios, { AxiosInstance, formToJSON } from "axios";
import env from "../env";

// Tipos
type FormType = Record<string, any>;
type RequiredFields = string[];
type SnackbarFn = (message: string, options?: { variant: "error" | "success" | "info" | "warning" }) => void;
type Callback<T = any> = (data: T) => void;
type SetLoadingFn = (loading: boolean) => void;

const api: AxiosInstance = axios.create({
    baseURL: env.API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

const petitions: any = {};

// Verificar formulario
export const verifyForm = (
    form: FormType,
    required: RequiredFields,
    enqueueSnackbar: SnackbarFn
): boolean => {
    for (let field of required) {
        if (!form[field]) {
            enqueueSnackbar(`Complete los campos obligatorios`, { variant: "error" });
            return false;
        }
    }
    return true;
};

// Hacer consulta
export const makeQuery = async (
    token: string | null,
    method: string,
    form: FormType | string,
    enqueueSnackbar?: SnackbarFn,
    onSuccess?: Callback,
    setLoading?: SetLoadingFn,
    onError?: Callback
): Promise<any> => {
    if (setLoading) setLoading(true);
    try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const { data } = await petitions[method](form);
        console.log("Method:", method, "Data:", data);
        if (onSuccess) onSuccess(data);
        return data;
    } catch (error: any) {
        console.error(error);
        const errorMessage =
            error.response?.data?.error ||
            error.response?.data?.message ||
            "Error en el servidor";

        if (enqueueSnackbar) {
            enqueueSnackbar(errorMessage, { variant: "error" });
        }
        if (onError) onError(error);
    } finally {
        if (setLoading) setLoading(false);
    }
};

// * AUTH
petitions.login = (form: FormType) => api.post("/auth/login", form);
petitions.whoiam = (token: string) => api.get(`/auth/whoiam/${token}`);

// * USER MANAGEMENT
petitions.createUser = (form: FormType) => api.post("/user", form);
petitions.getUsers = () => api.get("/user");
petitions.getCollaborators = () => api.get("/user/collaborators");
petitions.updateUser = (form: FormType) => api.put(`/user/${form._id}`, form);
petitions.deleteUser = (id: string) => api.delete(`/user/${id}`);
petitions.personalRotation = (form: FormType) => api.post(`/user/personal-rotation`, form);
petitions.payrollSummary = (form: FormType) => api.post(`/user/payroll-summary`, form);

// * PROJECTS
petitions.createProject = (form: FormType) => api.post("/project", form);
petitions.getProjects = () => api.get("/project");
petitions.getProject = (id: string) => api.get(`/project/${id}`);
petitions.getCollaboratorsStatus = () => api.get(`/project/assigned-status`);
petitions.getUserNotifications = () => api.get(`/project/notifications`);
petitions.updateProject = (form: FormType) => api.put(`/project/${form._id}`, form);
petitions.assignUserToProject = (form: FormType) => api.put(`/project/assign-user`, form);
petitions.deleteProject = (id: string) => api.delete(`/project/${id}`);
petitions.getUserProjects = () => api.get(`/project/user`);
petitions.getUserProjectsControl = (form: FormType) => api.post(`/project/control`, form);
petitions.getDaySummary = (form: FormType) => api.post(`/project/day-summary`, form);
petitions.getProjectCosts = (form: FormType) => api.post(`/project/costs`, form);
petitions.sendMail = (form: FormType) => api.post(`/project/send-mail`, form);
petitions.getEntriesByDate = (form: FormType) => api.post(`/project/entries-by-date`, form);
petitions.getCalendarData = (form: FormType) => api.get(`/project/calendar?projectId=${form.project}&month=${form.month}`);
petitions.getDailySummary = (form: FormType) => api.get(`/project/summary?projectId=${form.project}&date=${form.date}`);
petitions.postDailySummary = (form: FormType) => api.post(`/project/send-summary`, form);
petitions.getLlenados = () => api.get(`/project/unregistered`);

// * WORK ENTRIES
petitions.createWorkEntry = (form: FormType) => api.post("/work-entry", form);
petitions.getWorkEntries = (form: FormType) => api.post("/work-entry/getEntries", form);
petitions.getWorkEntry = (id: string) => api.get(`/work-entry/${id}`);
petitions.updateWorkEntry = (form: FormType) => api.put(`/work-entry/${form._id}`, form);
petitions.deleteWorkEntry = (id: string) => api.delete(`/work-entry/${id}`);

// * NOTIFICATIONS
petitions.getNotifications = () => api.get("/notification");
petitions.getUserNotifications = () => api.get("/notification/user");
petitions.getNotification = (id: string) => api.get(`/notification/${id}`);
petitions.createNotification = (form: FormType) => api.post("/notification", form);
petitions.updateNotification = (form: FormType) => api.put(`/notification/${form._id}`, form);
petitions.deleteNotification = (id: string) => api.delete(`/notification/${id}`);

// * EXTRA HOUR REQUESTS
petitions.createExtraHourRequest = (form: FormType) => api.post("/overtime", form);
petitions.getExtraHourRequests = (query: FormType = {}) => api.get("/overtime", { params: query });
petitions.getExtraHourRequest = (id: string) => api.get(`/overtime/${id}`);
petitions.updateExtraHourRequest = (form: FormType) => api.put(`/overtime/${form._id}`, form);
petitions.deleteExtraHourRequest = (id: string) => api.delete(`/overtime/${id}`);
petitions.approveExtraHourRequest = (form: FormType) => api.patch(`/overtime/${form._id}/approve`, form);


export default petitions;
