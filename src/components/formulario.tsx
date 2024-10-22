'use client'
import {Button } from 'primereact/button';
import { useEffect, useRef, useState } from 'react';
import { DataTable, DataTablePageEvent } from 'primereact/datatable';
import { InputText } from 'primereact/inputtext';
import { Column } from 'primereact/column';
import { ClienteModel, ClientService, DataResponse, PaisModel } from '@/service/ClientService';
import React from 'react';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { classNames } from 'primereact/utils';
import { ProgressSpinner } from 'primereact/progressspinner';
import { validateRut } from '@/validators/rut';
import { Toast } from 'primereact/toast';

export default function Formulario() {
    
    const [loading, setLoadingData] = useState(false);
    const dt = useRef<DataTable<any>>(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        searchTerm: '',
    });
    const [datas, setDatas] = useState<ClienteModel[]>([]);
    const [selectedDatas, setSelectedDatas] = useState(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    const [países, setPaises] = useState<PaisModel[]>([]);
    const toast = useRef(null);

    const formik = useFormik({
        initialValues: {
            id:0,
            nombre: '',
            apellido: '',
            rut: '',
            direccion: '',
            email: '',
            telefono: '',
            paisId: undefined,
        },
        validationSchema: Yup.object().shape({
            nombre: Yup.string()
                        .matches(/^[a-zA-Z\s]+$/, 'Caracteres no permitidos')
                        .required('Requerido'),
            apellido: Yup.string()
                        .matches(/^[a-zA-Z\s]+$/, 'Caracteres no permitidos')
                        .required('Requerido'),
            rut: Yup.string()
                    .test('rut', 'RUT inválido', value => validateRut(value))
                        .required('Requerido'),
            direccion: Yup.string()
                        .required('Requerido'),
            email: Yup.string()
                        .email('Email inválido')
                        .required('Requerido'),
            telefono: Yup.string()
                        .matches(/^\+\d{11}$/, 'Formato +569212345432')
                        .required('Requerido'),
            paisId: Yup.number()
                        .required('Requerido'),
        }),
        onSubmit: async (data : ClienteModel) => {
            console.log(data);            
                try {
                    setLoadingDialog(true)
                    if(data.id == 0){
                        const cliente =  await ClientService.saveCliente(data);
                        toast.current.show({
                            severity:'success', 
                            summary: 'Exito', 
                            detail:'Registrado con éxito',
                            life: 3000
                        });

                    }else{
                        const cliente = await ClientService.updateCliente(data.id!,data);
                        datas[index].Acciones!.loadingEdit = false;
                        setDatas([...datas]); 
                        toast.current.show({
                            severity:'success', 
                            summary: 'Exito',
                            detail:'Editado con éxito',
                            life: 3000
                        });

                    }
                    //console.log(cliente);
                    hideDialog();

                } catch (error) {
                    console.error('Error cliente:', error);
                    toast.current.show({
                        severity:'error', 
                        summary: 'Error',
                        detail:'Error al guardar cliente',
                        life: 3000
                    });
                //setLoadingData(false);
                }finally{
                    //setLoadingData(false);
                    loadData();
                    setLoadingDialog(false);
                }          

        },
    });

    //const [globalFilter, setGlobalFilter] = useState('');
    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center">
            <h5 className="m-0">Clientes</h5>
            <span className="block mt-2 md:mt-0 p-input-icon-left">
                <i className="pi pi-search ml-1" />
                <InputText className="pl-4" type="search"  placeholder="Search..." 
                onInput={(e) => onSearch(e.currentTarget.value)}
                />
            </span>
        </div>
    );

    const idBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Id</span>
                {rowData.id}
            </>
        );
    };

    const rutBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Rut</span>
                {rowData.rut}
            </>
        );
    };
    const nombreBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Nombre</span>
                {rowData.nombre} {rowData.apellido}
            </>
        );
    };

    const direccionBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Direccion</span>
                {rowData.direccion}
            </>
        );
    };

    const emailBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Email</span>
                {rowData.email}
            </>
        );
    };

    const telefonoBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Telefono</span>
                {rowData.telefono}
            </>
        );
    };

    const paisBodyTemplate = (rowData: any) => {
        return (
            <>
                <span className="p-column-title">Pais</span>
                {rowData.pais.nombre} 
            </>
        );
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <>
                <Button icon="pi pi-pencil" rounded severity="warning" className="mr-2" 
                        onClick={() => editData(rowData)}
                        loading={rowData.Acciones?.loadingEdit}
                        />
                <Button icon="pi pi-trash" rounded severity="danger" onClick={() => confirmDeleteProduct(rowData)} />
            </>
        );
    };
    
    useEffect(() => {
        loadData();
        loadPaises();
        },[lazyState]);

    const loadData = async () => {
        setLoadingData(true);
        try {
            const data = await ClientService.getClientes(lazyState);
            //console.log(data);
            setDatas(data.records );
            setTotalRecords(data.totalRecords as number);
        } catch (error) {
            console.error('Error fetching clientes:', error);
            //setLoadingData(false);
        }finally{
            setLoadingData(false);
        }
       // setProducts(productsList as any);
    };
    

    const loadPaises = async () => {
        try {
            const data = await ClientService.getPaises();
            //console.log(data);
            setPaises(data);
        } catch (error) {
              console.error('Error fetching paises:', error);
            //setLoadingData(false);
        }finally{
            //setLoadingData(false);
        }
    };
   
    const [submitted, setSubmitted] = useState(false);
    const [dataDialog, setDataDialog] = useState(false);
    const [loadingDialog, setLoadingDialog] = useState(false);
    const [index, setIndex] = useState(-1);

    const openNew = () => {
        //console.log('open new');
        formik.resetForm();
        setSubmitted(false);
        setDataDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setDataDialog(false);
        if(index > 0){
            datas[index].Acciones!.loadingEdit = false;
            setDatas([...datas]); 
        }
    };

    const dataDialogFooter =  (
        <>
            <Button label="Cancel" severity="danger" icon="pi pi-times" text onClick={hideDialog} />
            <Button label="Guardar" type='submit' severity="success" form="dataForm"  icon="pi pi-check" className='btn-success' text 
             loading={loadingDialog} />
        </>
    );

    const confirmDeleteSelected = () => {
        console.log('delete selected');
    };

    const editData = (data: ClienteModel) => {
        
        // Encontramos el índice del registro a modificar
        const index = datas.findIndex(d => d.id === data.id);
        setDataDialog(true);
        if (index !== -1) {
            // Modificamos el campo específico (loadingEdit) directamente en el array original
            //datas[index].Acciones.loadingEdit = true;
            datas[index]= {
                ...datas[index],
                Acciones: {
                    ...datas[index].Acciones,
                    loadingEdit: true,
                }
            };          
            // Actualizamos el estado
            setDatas([...datas]);  // Al usar spread, React detecta el cambio para renderizar
            setIndex(index);
            //setData(data);
            formik.setValues(data);

            


            
        }


        
    };

    const confirmDeleteProduct = (product: any) => {
        console.log(product);
    };

    const onPage = (e : DataTablePageEvent) => {
        console.log('page event');
        setlazyState(
            {
                ...lazyState,
                first: e.first,
                rows: e.rows,
            }
        );
    };

    const onSearch = (value: string) => {
        console.log('search event');
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }

        searchTimeout.current = setTimeout(() => {
            setlazyState(prevState => ({
                ...prevState,
                searchTerm: value,
            }));
        }, 1000);
    };

    const [sortField, setSortField] = useState<keyof ClienteModel>('id');
    const [sortOrder, setSortOrder] = useState<number>(-1);

    const sortData = (field: keyof ClienteModel, order: number) => {
        const sortedData = [...datas].sort((a, b) => {
            const aValue = getNestedValue(a, field);
            const bValue = getNestedValue(b, field);
            console.log(field, order);
            // Verifica si los valores son números
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return order === 1 ? aValue - bValue : bValue - aValue; // Ascendente o Descendente
            }else{
                // Normaliza las cadenas para la comparación
                const aString = typeof aValue === 'string' ? aValue.toLowerCase() : '';
                const bString = typeof bValue === 'string' ? bValue.toLowerCase() : '';

                // Comparar cadenas de texto sin distinción de mayúsculas
                if (aString < bString) return order === 1 ? -1 : 1; // Ascendente
                if (aString > bString) return order === 1 ? 1 : -1;  // Descendente

        return 0; // Igual
            }
        });
        console.log(sortedData);
        setDatas(sortedData);
        setSortField(field);
        setSortOrder(order);
    };
    // Función para obtener el valor de una propiedad anidada
    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    }

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <div className="my-2">
                    <Button label="Registrar" icon="pi pi-plus" severity="success" className=" mr-2" onClick={openNew} />
                    <Button label="Eliminar" icon="pi pi-trash" severity="danger" onClick={confirmDeleteSelected} disabled={!selectedDatas || !(selectedDatas as any).length} />
                </div>
            </React.Fragment>
        );
    };

    return (
        <>
        <div className="grid justify-content-center">
            <div className="md:col-8 col-12">            
                <div className="card">
                    <Toast ref={toast}  />
                    <Toolbar className='px-1 py-0 mb-1'  end={rightToolbarTemplate()} />               
                    
                    <DataTable
                                ref={dt}
                                value={datas}
                                selection={selectedDatas}
                                onSelectionChange={(e) => setSelectedDatas(e.value as any)}
                                dataKey="id"
                                paginator
                                lazy
                                first={lazyState.first} rows={lazyState.rows} rowsPerPageOptions={[5, 10, 25]} 
                                totalRecords={totalRecords} onPage={onPage}
                                className="datatable-responsive"
                                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
                                globalFilter={lazyState.searchTerm}
                                emptyMessage="Cliente no encontrado."
                                header={header}
                                responsiveLayout="scroll"
                                size='small'
                                loading={loading}
                                sortField={sortField} 
                                sortOrder={sortOrder}
                                onSort={(e) => sortData(e.sortField as keyof ClienteModel, e.sortOrder as number)}
                            >
                                <Column selectionMode="multiple" className="p-1" headerStyle={{ width: '4rem' }}></Column>
                                <Column field="id" className="p-1" header="id" sortable body={idBodyTemplate} ></Column>
                                <Column field="rut" className="p-1" header="rut" sortable body={rutBodyTemplate} ></Column>
                                <Column field="nombre" header="Nombre" className="p-1" sortable body={nombreBodyTemplate} headerStyle={{ minWidth: '15rem' }} ></Column>
                                <Column field="direccion" header="Direccion" className="p-1" sortable body={direccionBodyTemplate} ></Column>
                                <Column field="email" header="Email" className="p-1" sortable body={emailBodyTemplate} ></Column>
                                <Column field="telefono" header="Telefono" className="p-1" sortable body={telefonoBodyTemplate} ></Column>
                                <Column field="pais.nombre" header="Pais" className="p-1" sortable body={paisBodyTemplate} ></Column>
                                
                                <Column body={actionBodyTemplate} headerStyle={{ minWidth: '10rem' }}></Column>
                            </DataTable>

                </div>
            </div>
        </div>

        
            <Dialog visible={dataDialog}  style={{ width: '450px' }} header="Product Details" modal className="p-fluid" footer={dataDialogFooter} onHide={hideDialog}>
                {loadingDialog? (
                    <div className='flex justify-content-center align-items-center'>
                    <ProgressSpinner strokeWidth='3' />
                    </div>
                ):( 
                    <form id="dataForm" onSubmit={formik.handleSubmit}>
                        <div className="field">
                            <label htmlFor="rut">Rut</label>
                            <InputText
                                id="rut"
                                value={formik.values.rut}
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.rut && formik.errors.rut
                                })}
                                autoFocus
                                ></InputText>
                                {formik.touched.rut && formik.errors.rut ? (
                                    <small className="ng-dirty ng-invalid text-red-400">{formik.errors.rut}</small>
                                    ) : null}
                        </div>
                        <div className="field">
                            <label htmlFor="name">Nombre</label>
                            <InputText
                                id="nombre"
                                value={formik.values.nombre}
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.nombre && formik.errors.nombre
                                })}
                                autoFocus
                            />                
                            {formik.touched.nombre && formik.errors.nombre ? (
                                <small className="ng-dirty ng-invalid text-red-400">{formik.errors.nombre}</small>
                                ) : null}
                        </div>
                        <div className="field">
                            <label htmlFor='Apellido'>Apellido</label>
                            <InputText
                                id="apellido"
                                value={formik.values.apellido}
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.apellido && formik.errors.apellido
                                })}
                                autoFocus
                            />
                            {formik.touched.apellido && formik.errors.apellido ? (
                                <small className="ng-dirty ng-invalid text-red-400">{formik.errors.apellido}</small>
                                ) : null}
                        </div>
                        <div className="field">
                            <label htmlFor="direccion">Direccion</label>
                            <InputText
                                id="direccion"
                                value={formik.values.direccion}
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.direccion && formik.errors.direccion
                                })}
                                autoFocus
                            />
                            {formik.touched.direccion && formik.errors.direccion ? (
                                <small className="ng-dirty ng-invalid text-red-400">{formik.errors.direccion}</small>
                                ) : null}
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <InputText
                                id="email"
                                value={formik.values.email}
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.email && formik.errors.email
                                })}
                                autoFocus
                            />
                            {formik.touched.email && formik.errors.email ? (
                                <small className="ng-dirty ng-invalid text-red-400">{formik.errors.email}</small>
                                ) : null}
                        </div>
                        <div className="field">
                            <label htmlFor="telefono">Telefono</label>
                            <InputText
                                id="telefono"
                                value={formik.values.telefono}
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.telefono && formik.errors.telefono
                                })}
                                autoFocus
                            />
                            {formik.touched.telefono && formik.errors.telefono ? (
                                <small className="ng-dirty ng-invalid text-red-400">{formik.errors.telefono}</small>
                                ) : null}
                        </div>
                        <div className="field">
                            <label htmlFor="paisId">Pais</label>
                            <Dropdown
                                id="paisId"
                                value={formik.values.paisId}
                                options={países}
                                optionValue='id'
                                optionLabel='nombre'
                                filter
                                filterBy='nombre'
                                showClear
                                onChange={formik.handleChange}
                                className={classNames({
                                    'p-invalid': formik.touched.paisId && formik.errors.paisId
                                })}
                                
                            />
                            {formik.touched.paisId && formik.errors.paisId ? (
                                <small className="ng-dirty ng-invalid text-red-400">{formik.errors.paisId}</small>
                                ) : null}                    
                        </div>

                    
                    </form>
                )
                }
                

            </Dialog>

        </>
    )
}