"use client";

import {useState} from "react";
import styles from "../../../styles/file_uploader.module.css";

export default function FileUploader({ onFileSelect }: { onFileSelect: (file: File) => void }) {
	const [dragging, setDragging] = useState(false);
	const [fileName, setFileName] = useState<string | null>(null);

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(true);
	};

	const handleDragLeave = () => {
		setDragging(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) {
			setFileName(file.name);
			onFileSelect(file);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFileName(file.name);
			onFileSelect(file);
		}
	};

	return (
		<div className={`${styles.fileUploader} ${dragging ? styles.dragging : ""}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
			<input type="file" id="fileInput" className={styles.hiddenInput} onChange={handleFileChange} />
			<label htmlFor="fileInput" className={styles.label}>
				{fileName ? `Файл: ${fileName}` : "Перетащите файл сюда или нажмите для выбора"}
			</label>
		</div>
	);
}