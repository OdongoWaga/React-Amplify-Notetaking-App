import React, { Component } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { withAuthenticator } from "aws-amplify-react";
import { createNote } from "./graphql/mutations";

class App extends Component {
	state = {
		notes: [],
		note: ""
	};

	handleChangeNote = (e) => {
		this.setState({ note: e.target.value });
	};

	handleAddNote = (e) => {
		const { note } = this.state;
		e.preventDefault();
		const input = {
			note
		};
		API.graphql(graphqlOperation(createNote, { input }));
	};

	render() {
		const { notes } = this.state;
		return (
			<div className="flex flex-column items-center justify-center pa3 bg-washed-red">
				<h1 className="code f2-l">Note Taker</h1>
				<form onSubmit={this.handleAddNote} className="mb3">
					<input
						type="text"
						className="pa2 f4"
						placeholder="Write Your Note"
						onChange={this.handleChangeNote}
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
