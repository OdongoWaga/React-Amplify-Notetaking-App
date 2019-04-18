import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import {
	onCreateNote,
	onDeleteNote,
	onUpdateNote
} from "./graphql/subscriptions";

const App = () => {
	const [id, setId] = useState("");
	const [note, setNote] = useState("");
	const [notes, setNotes] = useState([]);

	useEffect(() => {
		getNotes();
		const createNoteListener = API.graphql(
			graphqlOperation(onCreateNote)
		).subscribe({
			next: (noteData) => {
				const newNote = noteData.value.data.onCreateNote;
				setNotes((prevNotes) => {
					const oldNotes = prevNotes.filter((note) => note.id !== newNote.id);
					const updatedNotes = [...oldNotes, newNote];
					return updatedNotes;
			}
		});
		const deleteNoteListener = API.graphql(
			graphqlOperation(onDeleteNote)
		).subscribe({
			next: (noteData) => {
				const deletedNote = noteData.value.data.onDeleteNote;
				
				// const updatedNotes = this.state.notes.filter(
				// 	(note) => note.id !== deletedNote.id
				// );
				// this.setState({ notes: updatedNotes });
			}
		});

		const updateNoteListener = API.graphql(
			graphqlOperation(onUpdateNote)
		).subscribe({
			next: (noteData) => {
				const { notes } = this.state;
				const updatedNote = noteData.value.data.onUpdateNote;
				const index = notes.findIndex((note) => note.id === updatedNote.id);
				const updatedNotes = [
					...notes.slice(0, index),
					updatedNote,
					...notes.slice(index + 1)
				];
				this.setState({ notes: updatedNotes, note: "", id: "" });
			}
		});

		return () => {
			createNoteListener.unsubscribe();
			deleteNoteListener.unsubscribe();
			updateNoteListener.unsubscribe();
		};
	}, []);

	const getNotes = async () => {
		const result = await API.graphql(graphqlOperation(listNotes));
		setNotes(result.data.listNotes.items);
	};

	const handleChangeNote = (e) => {
		setNote(e.target.value);
	};
	const hasExistingNote = () => {
		if (id) {
			//is this a valid id?
			const isNote = notes.findIndex((note) => note.id === id) > -1;
			return isNote;
		}
		return false;
	};

	const handleAddNote = async (e) => {
		e.preventDefault();

		//Check if there is an existing note, and if so update it
		if (hasExistingNote()) {
			handleUpdateNote();
		} else {
			const input = {
				note
			};
			await API.graphql(graphqlOperation(createNote, { input }));

			setNote("");
		}
	};

	const handleUpdateNote = async () => {
		const input = { id, note };
		await API.graphql(graphqlOperation(updateNote, { input }));
	};

	const handleDeleteNote = async (noteId) => {
		const input = { id: noteId };
		await API.graphql(graphqlOperation(deleteNote, { input }));
	};

	const handleSetNote = ({ note, id }) => {
		setNote(note);
		setId(id);
	};

	return (
		<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
			<h1 className="code f2-l">Note Taker</h1>
			<form onSubmit={handleAddNote} className="mb3">
				<input
					type="text"
					className="pa2 f4"
					placeholder="Write Your Note"
					onChange={handleChangeNote}
					value={note}
				/>
				<button className="pa2 f4">{id ? "Update Note" : "Add Note"}</button>
			</form>
			{/* Notes List*/}
			<div>
				{notes.map((item) => (
					<div key={item.id} className="flex items-center">
						<li onClick={() => handleSetNote(item)} className="list pa1 f3">
							{item.note}
						</li>
						<button
							onClick={() => handleDeleteNote(item.id)}
							className="bg-transparent bn f4"
						>
							<span>&times; </span>
						</button>
					</div>
				))}
			</div>
		</div>
	);
};

export default withAuthenticator(App, { includeGreetings: true });
