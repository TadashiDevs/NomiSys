// Definición de tipos e interfaces para el formulario de contratos

export interface Worker {
  id: number;
  name: string;
  cedula: string;
  department: string;
  status: string;
}

export interface FormData {
  workerId?: number;
  type: string;
  startDate?: Date;
  endDate?: Date;
  position: string;
  salary: string;
  status: string;

  department: string;
  shift: string;
  workday: string;
  pension: string;
}

export interface FormErrors {
  workerId: string;
  type: string;
  startDate: string;
  endDate: string;
  position: string;
  salary: string;
  status: string;

  department: string;
  shift: string;
  workday: string;
  pension: string;
}

export interface TouchedFields {
  workerId: boolean;
  type: boolean;
  startDate: boolean;
  endDate: boolean;
  position: boolean;
  salary: boolean;
  status: boolean;

  department: boolean;
  shift: boolean;
  workday: boolean;
  pension: boolean;
}

export interface ContratoFormProps {
  workers: Worker[];
  initialData?: FormData;
  isEditing?: boolean;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}
