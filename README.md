# react-from-scratch

A demo of setting up a react app in steps (see feature branches for the steps)

## Step 2

In step 2, we will create components that allow us to add Todos to a Todo list and mark them as 'done'.

---

### Create an AddTodo Component

First, we need to create a simple AddTodo component that will allow the user to enter a Todo name/title and pass that name to the parent component when the add button is clicked.

1. Create an `add-todo` directory `mkdir add-todo`
2. Create an `add-todo.scss` file for our styles (style it however you like).
3. Create an `index.js` file inside the directory. *Note:* We name the file index.js so that we can import it as `import AddTodo from './add-todo'`.  If we named the file `add-todo.js` we would have to do `import AddTodo from './add-todo/add-todo'`.

```sh
cd add-todo
touch index.js
```

4. Add the following code:

```jsx
import './add-todo.scss'; // import our styles for webpack to pick up

import React, { Component } from 'react';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';

export default class AddTodo extends Component {
    // In the constructor, we call super to have access to `this`.
    // We also find certain function to `this` for use inside event handlers
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

    // addTodo gets called on form submit via the onSubmit event binding
    addTodo (e) {
        e.preventDefault();
        // Access the input value and pass it to onAddTodo (which is passed from the parent via props)
        this.props.onAddTodo(e.target.todo_name.value);
        // Reset the form field(s)
        e.target.reset();
    }
}
```

### Modify App Component to Handle State

Now that we've created the AddTodo component, let's go ahead an set up our root App component to manage the state changes.  There are a couple things to note here:

1. We are currently going to be managing state in our root App component.  This is only temporary.  In later steps, we will transition to using connected components via Redux to manage state and event bindings.
2. Our components in the /components directory are 'dumb' components. They don't deal with managing state.  They simply accept props and use those props to create their functionality and diplay values. Any value that needs to be displayed is accessed via `this.props` and any event or change in a value is handled via a function that was passed to the component itself via `this.props`.  This is very important and will not change in subsequent steps.  In later steps, we will transition to using connected components that will bind themselves to the redux store and then pass state to 'dumb' components via props.  These connected components will not live inside the /components directory to maintain a separation of concerns for different component types.

Add 3 class methods to the App component.  These will handle changes for adding, editing, and checking Todos:

```javascript
// When a todo is added, this gets called accepting a string (the Todo title) as a parameter.
// We then reset the state adding a new Todo to the beginning of the array.
// Not that we are creating a brand new state object to avoid state mutability bugs
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

// When a todo is checked or unchecked, this gets called accepting a Todo id and new isDone value as parameters.
// We reset the state and set the isDone property of the changed Todo to the new isDone value
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

// When a todo's edit button is clicked, this gets called accepting a todo object as a parameter.
// For now, this only logs the object.  We will do more with this when we add routing in a later step
onTodoEdit (todo) {
    console.log('Edit Todo:', todo);
}
```

Next, we need to import our components into the App component:

```javascript
import MainNav from './main-nav';
import AddTodo from './add-todo';
import TodoList from './todo-list'; // We will create this one in the next step
```

We need to modify the App component constructor to do several things:

```javascript
constructor (props) {
    super(props);
    this.onAddTodo = this.onAddTodo.bind(this);
    this.onTodoChecked = this.onTodoChecked.bind(this);
    this.onTodoEdit = this.onTodoEdit.bind(this);

    this.state = {
        todos: []
    };
}
```

This accomplishes the following:

1. The call to super() allows us to use `this` correctly in the constructor
2. We bind `this` to our class methods that will be passed to the child components (see below)
3. Initializes `this.state`

Finally, we simply add our `<AddTodo>` and `<TodoList>` components to our render() method and bind their props.  Our final render method should look like this:

```jsx
render() {
    return (
        <div>
            <MainNav />
            <AddTodo onAddTodo={this.onAddTodo} />
            <TodoList todos={this.state.todos} onTodoChecked={this.onTodoChecked} onTodoEdit={this.onTodoEdit} />
        </div>
    );
}
```

### Create a TodoList Component

Finally, we need to create a simple TodoList component that will accept a list of todos and bind callbacks when a Todo's checkbox is changed or when its edit button is clicked.

1. Create a `todo-list` directory `mkdir todo-list`
2. Create a `todo-list.scss` file for our styles (style it however you like).
3. Create an `index.js` file inside the directory. See above note for why we name it `index.js`
4. Add the following code to `index.js`:

```jsx
import './todo-list.scss'; // import our styles for webpack to pick up

import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Checkbox, Button } from 'react-bootstrap';

export default class TodoList extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <ListGroup className="todo-list">
                {/* This is how we repeat element/components is JSX */}
                {this.props.todos.map((todo) => (
                    {/* We add a unique key identifier for React's performance checker.  React complains if you don't add this. */}
                    <ListGroupItem key={todo.id} className="todo-item clearfix">
                        {/* Bind the checked value to isDone.
                          * Bind the onChange handler to the onTodoChecked callback passed via props.  Notice that we use an arrow
                          * function to avoid creating a new class method like we did in the AddTodo component */}
                        <Checkbox className="checkbox" checked={todo.isDone} onChange={(e) => this.props.onTodoChecked(todo.id, !todo.isDone)} />
                        <h4>{todo.title}</h4>
                        <Button className="glyphicon glyphicon-edit" onClick={(e) => this.props.onTodoEdit(todo)} />
                    </ListGroupItem>
                ))}
            </ListGroup>
        );
    }
}
```

### Wrap Up

In this step, we added the ability to add Todos to a Todo list and mark them as done.  In subsequent steps, we will add the ability to categorize Todos and refactor the code to use Redux and the React Router to simplify state management.