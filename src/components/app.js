import React, { Component } from 'react';

import MainNav from './main-nav';
import AddTodo from './add-todo';
import TodoList from './todo-list';

export default class App extends Component {
    constructor (props) {
        super(props);
        this.onAddTodo = this.onAddTodo.bind(this);
        this.onTodoChecked = this.onTodoChecked.bind(this);
        this.onTodoEdit = this.onTodoEdit.bind(this);

        this.state = {
            todos: []
        };
    }

    render() {
        return (
            <div>
                <MainNav />
                <AddTodo onAddTodo={this.onAddTodo} />
                <TodoList todos={this.state.todos} onTodoChecked={this.onTodoChecked} onTodoEdit={this.onTodoEdit} />
            </div>
        );
    }

    onAddTodo (value) {
        this.setState({
            todos: [{
                id: this.state.todos.length + 1,
                title: value,
                isDone: false,
                description: null
            }, ...this.state.todos] 
        });
    }

    onTodoChecked (id, isDone) {
        this.setState({
            todos: this.state.todos.map((todo) => {
                return todo.id !== id ? todo : {
                    id: todo.id,
                    title: todo.title,
                    isDone: isDone,
                    description: todo.description
                };
            })
        });
    }

    onTodoEdit (todo) {
        console.log('Edit Todo:', todo);
    }
}