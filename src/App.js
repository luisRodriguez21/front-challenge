import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import Moveable from "react-moveable";
import stles from "./styles.css";

const App = () => {
	const [moveableComponents, setMoveableComponents] = useState([]);
	const [selected, setSelected] = useState(null);
	const [images, setImages] = useState([])


	
	async function fetchExample() { // obtiene datos de las imagenes de la API
		try {

			await fetch('https://jsonplaceholder.typicode.com/photos')
		  	.then((response) => response.json()) 	 // checar si checamos el estatos
			.then(function(resp){
				setImages(resp);
			});

		} catch (error) {
		  console.log('Hubo un problema con la petición Fetch');
		}
	}


	useEffect(() => {
		fetchExample() // llama la funcion y es async ya que esperamos una respuesta
    },[]);



	const addMoveable = () => { // Create a new moveable component and add it to the array
		
		setMoveableComponents([ // setena valor de la nueva imagen que se visualizara
			...moveableComponents, // guarda los datos anteriores del array para no perderlos al agregar uno nuevo
			{
				id: Math.floor(Math.random() * Date.now()),
				top: 0,
				left: 0,
				width: 100,
				height: 100,
				image: images[Math.floor(Math.random() * images.length)], // selecciona una imagen apartir de la longitud del array 
				updateEnd: true
			},
		]);
	};
 
	const updateMoveable = (id, newComponent, updateEnd = false) => { // esta funcion se llama cuando se hace un drag desde el componente 
		const updatedMoveables = moveableComponents.map((moveable, i) => {
			if (moveable.id === id) {
				return { id, ...newComponent, updateEnd };
			}
			return moveable;
		});
		setMoveableComponents(updatedMoveables);
	};
	


	const removeMoveableSelected = () => { // elimina imagen seleccionada 
		console.log("removeMoveable");
		console.log("id selected: ",selected);
		console.log("images current: ",moveableComponents);

		const newImages = moveableComponents.filter((img) => img.id !== selected); // en una nueva constante guarda los valores que sean diferente al id seleccionado
		setMoveableComponents(newImages); // setea el nuevo array sin la imagen que teniamos seleccionada

		console.log("images after delete: ",moveableComponents);
	};

	const removeMoveableAll = () => { // elimina todas las imagenes en el componente
		console.log("removeMoveable");
		setMoveableComponents([]); // para eliminar le pasamos un array vacio a la constante
	};
	

	const handleResizeStart = (index, e) => {
		console.log("e", e.direction);
		// Check if the resize is coming from the left handle
		const [handlePosX, handlePosY] = e.direction;
		// 0 => center
		// -1 => top or left
		// 1 => bottom or right

		// -1, -1
		// -1, 0
		// -1, 1
		if (handlePosX === -1) {
			console.log("width", moveableComponents, e);
			// Save the initial left and width values of the moveable component
			const initialLeft = e.left;
			const initialWidth = e.width;

			// Set up the onResize event handler to update the left value based on the change in width
		}
	};

	return (
		<main style={{ height : "100vh", width: "100vw" }}>
			<div className="btn-content">	
				<button className="btn" onClick={addMoveable}>Add Moveable1</button>
				<button className="btn" onClick={removeMoveableSelected}>Delete Moveable selected</button>
				<button className="btn" onClick={removeMoveableAll}>Delete all</button>
			</div>
			
			<div
				id="parent"
				style={{
					position: "relative",
					background: "black",
					height: "80vh",
					width: "80vw",
					left: "10em"
				}}
			>
				{moveableComponents.map((item, index) => (
					<Component
						{...item}
						key={index}
						updateMoveable={updateMoveable}
						handleResizeStart={handleResizeStart}
						setSelected={setSelected}
						isSelected={selected === item.id}
					/>
				))}
			</div>

		</main>
	);
};

export default App;

const Component = ({ // recibe props 
	updateMoveable,	
	handleResizeStart,
	top,
	left,
	width,
	height,
	index,
	image,
	id,
	setSelected,
	isSelected = false,
	updateEnd,
}) => {
	const ref = useRef();

	const [nodoReferencia, setNodoReferencia] = useState({
		top,
		left,
		width,
		height,
		index,
		image,
		id,
	});



	let parent = document.getElementById("parent");
	let parentBounds = parent?.getBoundingClientRect();

	const onResize = async (e) => {
		// ACTUALIZAR ALTO Y ANCHO
		let newWidth = e.width;
		let newHeight = e.height;

		const positionMaxTop = top + newHeight;
		const positionMaxLeft = left + newWidth;

		if (positionMaxTop > parentBounds?.height)
			newHeight = parentBounds?.height - top;
		if (positionMaxLeft > parentBounds?.width)
			newWidth = parentBounds?.width - left;


		updateMoveable(id, {
			top,
			left,
			width: newWidth,
			height: newHeight,
			image,
		});

		// ACTUALIZAR NODO REFERENCIA
		const beforeTranslate = e.drag.beforeTranslate;

		ref.current.style.width = `${e.width}px`;
		ref.current.style.height = `${e.height}px`;

		let translateX = beforeTranslate[0];
		let translateY = beforeTranslate[1];

		ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

		setNodoReferencia({
			...nodoReferencia,
			translateX,
			translateY,
			top: top,
			left: left
		});

		handleResizeStart(id, e);
	};

	const onResizeEnd = async (e) => { // se llama cuando finaliza el cambio de tamaño
		let newWidth = e.lastEvent?.width;
		let newHeight = e.lastEvent?.height;

		const positionMaxTop = top + newHeight;
		const positionMaxLeft = left + newWidth;

		if (positionMaxTop > parentBounds?.height)
			newHeight = parentBounds?.height - top;
		if (positionMaxLeft > parentBounds?.width)
			newWidth = parentBounds?.width - left;

		const { lastEvent } = e;
		const { drag } = lastEvent;
		const { beforeTranslate } = drag;

		updateMoveable(
			id,
			{
				top: top,
				left: left,
				width: newWidth,
				height: newHeight,
				image,
			},
			true
		);
	};

    return (
		<>
			<img
				ref={ref}
				src={image.url}
				className="draggable"
				id={"component-" + id}
				style={{
					position: "absolute",
					top: top,
					left: left,
					width: width,
					height: height,
				}}
				onClick={() => setSelected(id)}
			/>

			<Moveable
				target={isSelected && ref.current}
				resizable
				draggable
				onDrag={(e) => {	
					updateMoveable(id, {
						top: e.top,
						left: e.left,
						width,
						height,
						image,
					});
				}}
				onResize={onResize}
				onResizeEnd={onResizeEnd}
				keepRatio={false}
				throttleResize={1}
				renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
				edge={false}
				zoom={1}
				origin={false}
				padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
			/>
		</>
  	);
};
