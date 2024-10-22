import axios from 'axios';
export interface ClienteModel {
    id?: number;
    nombre?: string;
    apellido?: string;
    rut?: string;
    direccion?: string;
    email?: string;
    telefono?: string;
    paisId?: number;
    pais?: PaisModel;
    Acciones?: Acciones;
  }
  export interface PaisModel {
    id?: number;
    nombre?: string;
  }
  interface Acciones{
    loadingEdit?: boolean ;
    loadingDelete?: boolean;
  }

  export interface DataResponse {
    records: ClienteModel[];
    totalRecords: number;
  }

const url = 'https://localhost:7273';
export const ClientService = {
    
    // Obtener todos los clientes
  async getClientes(lazyState: any): Promise<DataResponse> {
    const { first, rows, searchTerm } = lazyState;
    
    // Crear los parámetros de consulta con URLSearchParams
    const params = new URLSearchParams({
        first: first.toString(),  // Convertir a string
        rows: rows.toString(),     // Convertir a string
        searchTerm: searchTerm, // Convertir a string
    });

     // Concatenar la URL con los parámetros
    const response = await fetch(`${url}/clientes?${params.toString()}`);
    if (!response.ok) {
      throw new Error('Error al obtener los clientes');
    }
    return response.json();
  },

  async getPaises(): Promise<PaisModel[]> {
    const response = await fetch(`${url}/pais`);
    if (!response.ok) {
      throw new Error('Error al obtener los paises');
    }
    return response.json();
  },

  async saveCliente(cliente: ClienteModel): Promise<ClienteModel> {
    try{
      const response = await axios.post(`${url}/clientes`, cliente);
      return response.data;
    }catch(error){
      //console.log(error);
      throw new Error('Error al guardar cliente');
    }
  },
  async updateCliente(id: number, data: ClienteModel): Promise<ClienteModel>{
    try{
      const response = await axios.put(`${url}/clientes?id=${id}`,data)
      return response.data;
    }catch(error){
      //console.log(error)
      throw new Error('Error al update');
    }
  }


}