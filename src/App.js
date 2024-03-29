import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote, deleteNote, updateNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";
import {
	onCreateNote,
	onDeleteNote,
	onUpdateNote
} from "./graphql/subscriptions";

class App extends Component {
	state = {
		notes: [],
		id: "",
		note: ""
	};

	componentDidMount() {
		this.getNotes();
		this.createNoteListener = API.graphql(
			graphqlOperation(onCreateNote)
		).subscribe({
			next: (noteData) => {
				const newNote = noteData.value.data.onCreateNote;
				const prevNote = this.state.notes.filter(
					(note) => note.id !== newNote.id
				);
				const updatedNotes = [...prevNote, newNote];
				this.setState({ notes: updatedNotes });
			}
		});
		this.deleteNoteListener = API.graphql(
			graphqlOperation(onDeleteNote)
		).subscribe({
			next: (noteData) => {
				const deletedNote = noteData.value.data.onDeleteNote;
				const updatedNotes = this.state.notes.filter(
					(note) => note.id !== deletedNote.id
				);
				this.setState({ notes: updatedNotes });
			}
		});

		this.updateNoteListener = API.graphql(
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
	}

	componentWillUnmount() {
		this.createNoteListener.unsubscribe();
		this.deleteNoteListener.unsubscribe();
		this.updateNoteListener.unsubscribe();
	}

	getNotes = async () => {
		const result = await API.graphql(graphqlOperation(listNotes));
		this.setState({ notes: result.data.listNotes.items });
	};

	handleChangeNote = (e) => {
		this.setState({ note: e.target.value });
	};
	hasExistingNote = () => {
		const { notes, id } = this.state;
		if (id) {
			//is this a valid id?
			const isNote = notes.findIndex((note) => note.id === id) > -1;
			return isNote;
		}
		return false;
	};

	handleAddNote = async (e) => {
		const { note, notes } = this.state;
		e.preventDefault();

		//Check if there is an existing note, and if so update it
		if (this.hasExistingNote()) {
			this.handleUpdateNote();
		} else {
			const input = {
				note
			};
			await API.graphql(graphqlOperation(createNote, { input }));
			// const newNote = result.data.createNote;
			// const updatedNotes = [newNote, ...notes];
			this.setState({ note: "" });
		}
	};

	handleUpdateNote = async () => {
		const { id, note } = this.state;
		const input = { id, note };
		await API.graphql(graphqlOperation(updateNote, { input }));
		// const updatedNote = result.data.updateNote;
		// const index = notes.findIndex((note) => note.id === updatedNote.id);
		// const updatedNotes = [
		// 	...notes.slice(0, index),
		// 	updatedNote,
		// 	...notes.slice(index + 1)
		// ];
		// this.setState({ notes: updatedNotes, note: "", id: "" });
	};

	handleDeleteNote = async (noteId) => {
		const { notes } = this.state;
		const input = { id: noteId };
		await API.graphql(graphqlOperation(deleteNote, { input }));
		// const deletedNoteId = result.data.deleteNote.id;
		// const updatedNotes = notes.filter((note) => note.id !== deletedNoteId);
		// this.setState({ notes: updatedNotes });
	};

	handleSetNote = ({ note, id }) => {
		this.setState({ note, id });
	};

	render() {
		const { notes, note, id } = this.state;
		return (
			<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
				<h1 className="code f2-l">Note Taker</h1>
				<form onSubmit={this.handleAddNote} className="mb3">
					<input
						type="text"
						className="pa2 f4"
						placeholder="Write Your Note"
						onChange={this.handleChangeNote}
						value={note}
					/>
					<button className="pa2 f4">{id ? "Update Note" : "Add Note"}</button>
				</form>
				{/* Notes List*/}
				<div>
					{notes.map((item) => (
						<div key={item.id} className="flex items-center">
							<li
								onClick={() => this.handleSetNote(item)}
								className="list pa1 f3"
							>
								{item.note}
							</li>
							<button
								onClick={() => this.handleDeleteNote(item.id)}
								className="bg-transparent bn f4"
							>
								<span>&times; </span>
							</button>
						</div>
					))}
				</div>
			</div>
		);
	}
}

export default withAuthenticator(App, { includeGreetings: true });
