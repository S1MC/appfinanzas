let movimientos = [];

function obtenerNumero(id) {
  return Number(document.getElementById(id).value) || 0;
}

function formatoCLP(valor) {
  return valor.toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  });
}

function calcular() {
  const sueldo = obtenerNumero("sueldo");
  const bono = obtenerNumero("bono");
  const recibeBono = document.getElementById("recibeBono").checked;

  const tarjeta = obtenerNumero("tarjeta");
  const combustible = obtenerNumero("combustible");
  const cuentas = obtenerNumero("cuentas");
  const comida = obtenerNumero("comida");
  const ocio = obtenerNumero("ocio");
  const imprevistos = obtenerNumero("imprevistos");

  const deudaActual = obtenerNumero("deudaActual");
  const abonoExtra = obtenerNumero("abonoExtra");

  const ingresoMes = sueldo + (recibeBono ? bono : 0);

  const gastosFijos =
    tarjeta +
    combustible +
    cuentas +
    comida +
    ocio +
    imprevistos;

  let totalMovimientos = 0;

  movimientos.forEach((mov) => {
    if (mov.tipo === "ingreso") {
      totalMovimientos += mov.monto;
    } else {
      totalMovimientos -= mov.monto;
    }
  });

  const disponible = ingresoMes - gastosFijos + totalMovimientos;

  const pagoTotalDeuda = tarjeta + abonoExtra;
  const deudaRestante = Math.max(0, deudaActual - pagoTotalDeuda);

  let mesesParaSalir = 0;

  if (pagoTotalDeuda > 0 && deudaActual > 0) {
    mesesParaSalir = Math.ceil(deudaActual / pagoTotalDeuda);
  }

  document.getElementById("resIngreso").textContent = formatoCLP(ingresoMes);
  document.getElementById("resGastos").textContent = formatoCLP(gastosFijos);
  document.getElementById("resMovimientos").textContent = formatoCLP(totalMovimientos);
  document.getElementById("resDisponible").textContent = formatoCLP(disponible);
  document.getElementById("resDeuda").textContent = formatoCLP(deudaRestante);
  document.getElementById("resMeses").textContent = mesesParaSalir;

  return {
    ingresoMes,
    gastosFijos,
    totalMovimientos,
    disponible,
    deudaRestante,
    mesesParaSalir
  };
}

function agregarMovimiento() {
  const tipo = document.getElementById("tipoMovimiento").value;
  const categoria = document.getElementById("categoriaMovimiento").value.trim();
  const monto = obtenerNumero("montoMovimiento");
  const descripcion = document.getElementById("descripcionMovimiento").value.trim();

  if (!categoria || monto <= 0) {
    alert("Debes ingresar categoría y monto válido.");
    return;
  }

  movimientos.push({
    tipo,
    categoria,
    monto,
    descripcion
  });

  document.getElementById("categoriaMovimiento").value = "";
  document.getElementById("montoMovimiento").value = "";
  document.getElementById("descripcionMovimiento").value = "";

  renderizarMovimientos();
  guardarDatos();
  calcular();
}

function renderizarMovimientos() {
  const tabla = document.getElementById("tablaMovimientos");
  tabla.innerHTML = "";

  movimientos.forEach((mov, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${mov.tipo}</td>
      <td>${mov.categoria}</td>
      <td>${formatoCLP(mov.monto)}</td>
      <td>${mov.descripcion || "-"}</td>
      <td><button class="danger" onclick="eliminarMovimiento(${index})">Eliminar</button></td>
    `;

    tabla.appendChild(fila);
  });
}

function eliminarMovimiento(index) {
  movimientos.splice(index, 1);
  renderizarMovimientos();
  guardarDatos();
  calcular();
}

function guardarDatos() {
  const datos = {
    sueldo: obtenerNumero("sueldo"),
    bono: obtenerNumero("bono"),
    recibeBono: document.getElementById("recibeBono").checked,
    tarjeta: obtenerNumero("tarjeta"),
    combustible: obtenerNumero("combustible"),
    cuentas: obtenerNumero("cuentas"),
    comida: obtenerNumero("comida"),
    ocio: obtenerNumero("ocio"),
    imprevistos: obtenerNumero("imprevistos"),
    deudaActual: obtenerNumero("deudaActual"),
    abonoExtra: obtenerNumero("abonoExtra"),
    movimientos
  };

  localStorage.setItem("controlFinanzas", JSON.stringify(datos));
  alert("Datos guardados correctamente.");
}

function cargarDatos() {
  const datosGuardados = localStorage.getItem("controlFinanzas");

  if (!datosGuardados) {
    calcular();
    return;
  }

  const datos = JSON.parse(datosGuardados);

  document.getElementById("sueldo").value = datos.sueldo ?? 500000;
  document.getElementById("bono").value = datos.bono ?? 250000;
  document.getElementById("recibeBono").checked = datos.recibeBono ?? false;
  document.getElementById("tarjeta").value = datos.tarjeta ?? 250000;
  document.getElementById("combustible").value = datos.combustible ?? 90000;
  document.getElementById("cuentas").value = datos.cuentas ?? 70000;
  document.getElementById("comida").value = datos.comida ?? 40000;
  document.getElementById("ocio").value = datos.ocio ?? 30000;
  document.getElementById("imprevistos").value = datos.imprevistos ?? 30000;
  document.getElementById("deudaActual").value = datos.deudaActual ?? 1500000;
  document.getElementById("abonoExtra").value = datos.abonoExtra ?? 0;

  movimientos = datos.movimientos ?? [];

  renderizarMovimientos();
  calcular();
}

function borrarTodo() {
  const confirmar = confirm("¿Seguro que quieres borrar todos los datos?");

  if (!confirmar) {
    return;
  }

  localStorage.removeItem("controlFinanzas");
  movimientos = [];
  renderizarMovimientos();
  location.reload();
}

function exportarCSV() {
  let csv = "tipo,categoria,monto,descripcion\n";

  movimientos.forEach((mov) => {
    csv += `${mov.tipo},${mov.categoria},${mov.monto},${mov.descripcion}\n`;
  });

  const archivo = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(archivo);

  const link = document.createElement("a");
  link.href = url;
  link.download = "movimientos_finanzas.csv";
  link.click();

  URL.revokeObjectURL(url);
}

window.onload = cargarDatos;
