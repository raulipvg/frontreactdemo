export  function validateRut(rut: string | undefined): boolean {
    if (!rut || typeof rut !== 'string') return false;
  
    // Eliminar puntos, guiones y convertir a mayúsculas
    const cleanRut = rut.replace(/[\.\-]/g, '').toUpperCase();
  
    // Validar formato y longitud mínima
    if (!/^\d{7,8}[0-9K]$/.test(cleanRut)) return false;
  
    // Separar número y dígito verificador
    const rutSinDv = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1);
  
    // Calcular el dígito verificador
    let suma = 0;
    let factor = 2;
  
    for (let i = rutSinDv.length - 1; i >= 0; i--) {
      suma += +rutSinDv[i] * factor;
      factor = factor === 7 ? 2 : factor + 1;
    }
  
    const dvCalculado = (11 - (suma % 11)).toString();
    const dvFinal = dvCalculado === '11' ? '0' : dvCalculado === '10' ? 'K' : dvCalculado;
  
    return dv === dvFinal;
  }