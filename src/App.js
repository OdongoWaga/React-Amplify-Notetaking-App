import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote } from "./graphql/mutations";
import { listNotes } from "./graphql/queries";

class App extends Component {
	state = {
		notes: [],
		note: ""
	};

	async componentDidMount() {
		const result = await API.graphql(graphqlOperation(listNotes));
		this.setState({ notes: result.data.listNotes.items });
	}

	handleChangeNote = (e) => {
		this.setState({ note: e.target.value });
	};

	handleAddNote = async (e) => {
		const { note, notes } = this.state;
		e.preventDefault();
		const input = {
			note
		};
		const result = await API.graphql(graphqlOperation(createNote, { input }));
		const newNote = result.data.createNote;
		const updatedNotes = [newNote, ...notes];
		this.setState({ notes: updatedNotes, note: "" });
	};

	render() {
		const { notes, note } = this.state;
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
					<button className="pa2 f4">Add Note</button>
				</form>
				{/* Notes List*/}
				<div>
					{notes.map((item) => (
						<div key={item.id} className="flex items-center">
							<li className="list pa1 f3">{item.note}</li>
							<button className="bg-transparent bn f4">
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
