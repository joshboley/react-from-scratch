import './todo.scss';

import React, { Component } from 'react';
import { FormControl, Checkbox, Button } from 'react-bootstrap';

export default class Todo extends Component {
    constructor (props) {
        super(props);
        this.onSave = this.onSave.bind(this);
    }

    render () {
        return (
            <form className="todo" onSubmit={this.onSave}>
                <div className="button-container">
                    <Button type="submit">Save Changes</Button>
                    <Button onClick={e => this.props.onCancel()}>Cancel</Button>
                </div>
                <div className="form-container">
                    <FormControl name="todo_name" type="text" placeholder="Todo Title" defaultValue={(this.props.todo && this.props.todo.title) || undefined} autoFocus />
                    <Checkbox name="todo_done" className="active" defaultChecked={(this.props.todo && this.props.todo.isDone)}>Done</Checkbox>
                    <FormControl name="todo_description" componentClass="textarea" placeholder="Description" defaultValue={(this.props.todo && this.props.todo.description) || undefined} />
                </div>
            </form>
        );
    }

    onSave (e) {
        e.preventDefault();

        this.props.onSave({
            ...this.props.todo,
            title: e.target.todo_name.value,
            isDone: e.target.todo_done.checked,
            description: e.target.todo_description.value
        });
    }
}