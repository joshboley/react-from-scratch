import './add-todo.scss';

import React, { Component } from 'react';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';

export default class AddTodo extends Component {
    constructor (props) {
        super(props);
        this.addTodo = this.addTodo.bind(this);
    }

    render () {
        return (
            <form className="add-todo" onSubmit={this.addTodo}>
                <FormGroup className="clearfix">
                    <InputGroup>
                        <FormControl name="todo_name" type="text" placeholder="Add Todo" />
                        <InputGroup.Button>
                            <Button type="submit">Add</Button>
                        </InputGroup.Button>    
                    </InputGroup>
                </FormGroup>
            </form>
        );
    }

    addTodo (e) {
        e.preventDefault();
        this.props.onAddTodo(e.target.todo_name.value);
        e.target.reset();
    }
}