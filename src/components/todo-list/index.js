import './todo-list.scss';

import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Checkbox, Button } from 'react-bootstrap';

export default class TodoList extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <ListGroup className="todo-list">
                {this.props.todos && this.props.todos.map((todo) => (
                    <ListGroupItem key={todo.id} className="todo-item clearfix">
                        <Checkbox className="checkbox" checked={todo.isDone} onChange={(e) => this.props.onTodoChecked(todo.id, !todo.isDone)} />
                        <h4>{todo.title}</h4>
                        <Button className="glyphicon glyphicon-edit" onClick={(e) => this.props.onTodoEdit(todo)} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        );
    }
}