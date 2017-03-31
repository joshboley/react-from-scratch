# react-from-scratch

A demo of setting up a react app in steps (see feature branches for the steps)

## Step 5

In step 5, we will add the ability to edit a Todo.

---

### Create Todo Component

First, we need to create a simple Todo component that will allow the user to edit a Todo name/title, description, and done properties as well as pass that information back to the parent component when the save button is clicked.

1. Create a `todo` directory `mkdir todo`
2. Create a `todo.scss` file for our styles (style it however you like).
3. Create an `index.js` file inside the directory. *Note:* We name the file index.js so that we can import it as `import Todo from './todo'`.  If we named the file `todo.js` we would have to do `import Todo from './todo/todo'`.
4. Add the following code to `index.js`:

```jsx
import './todo.scss'; // import our styles for webpack to pick up

import React, { Component } from 'react';
import { FormControl, Checkbox, Button } from 'react-bootstrap';

export default class Todo extends Component {
    // Call super so we have access to 'this'
    // Bind any functions that will be called inside our markup
    // Our custom properties on 'props' are:
    // {
    //      todo, // The todo to edit
    //      onSave, // Function
    //      onCancel, // Function
    //      ...props, // Anything react binds automatically
    // }
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
                    {/* A note about the react-bootstrap Checkbox...When setting a default value, 
                     use defaultChecked.  Per the docs, if defaultChecked is used, you must use className of 'active' */}
                    <Checkbox name="todo_done" className="active" defaultChecked={(this.props.todo && this.props.todo.isDone)}>Done</Checkbox>
                    <FormControl name="todo_description" componentClass="textarea" placeholder="Description" defaultValue={(this.props.todo && this.props.todo.description) || undefined} />
                </div>
            </form>
        );
    }

    // Gets the input values and passes them to onSave passedin from props
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
```

### Enhance CategoryList

We need to enhance the CategoryList component to handle an onCategoryAssigned binding when the user clicks the 'assign' button on a category.  However, we only want this button visible when a Todo is in edit mode.  Therefore, we will use the isEditMode binding to hide/show certain button in edit mode.

```jsx
renderCategories (categories) {
    return (
        <ListGroup className="category-list">
            {categories.map((category) => {
                return (
                    <ListGroupItem key={category.id} className={"category-item clearfix " + (this.props.selectedCategoryId === category.id ? "active" : "")}>
                        <div className="clickable-area" onClick={e => this.props.onCategorySelected(category)}></div>
                        <div className="pull-left">
                            <Button className={"glyphicon glyphicon-chevron-" + (category.isExpanded ? "down" : "right")} 
                                    onClick={(e) => this.props.onCategoryExpanded(category.id, !category.isExpanded)} />
                            <span>{category.title}</span>
                            {/* Hide this button in edit mode */}
                            {!this.props.isEditMode && <Button className="glyphicon glyphicon-edit" onClick={(e) => this.props.onCategoryEditButtonClicked(category)} />}
                        </div>
                        <div className="pull-right">
                            {/* Show this button in edit mode.  Also, bind onCategoryAssigned */}
                            {this.props.isEditMode && <Button className="glyphicon glyphicon-share" onClick={(e) => this.props.onCategoryAssigned(category.id)} />}
                            {/* Hide this button in edit mode */}
                            {!this.props.isEditMode && <Button className="glyphicon glyphicon-trash" onClick={(e) => this.props.onCategoryDelete(category.id)} />}
                            {/* Hide this button in edit mode */}
                            {!this.props.isEditMode && <Button className="glyphicon glyphicon-plus" onClick={(e) => this.props.onCategoryAddButtonClicked(category)} />}
                        </div>
                        {category.isExpanded && category.children && category.children.length > 0 && this.renderCategories(category.children)}
                    </ListGroupItem>
                );
            })}
        </ListGroup>
    );
}
```

### Modify App Component

Next, we need to modify the App component to handle state changes when the handlers passed to child components get called.

1. When a Todo is added, we need to add it's category id.  This will allows us to track the category for use later in case it gets reassigned to a new category:

```javascript
onAddTodo (value) {
    if (!this.state.selectedCategory) return;

    let selectedTodos = [{
        id: guid(),
        // This is the new line for this Step
        category: this.state.selectedCategory.id,
        title: value,
        isDone: false,
        description: null
    }, ...(this.state.selectedTodos || [])];

    this.setState({
        todos: {
            ...this.state.todos,
            [this.state.selectedCategory.id]: selectedTodos
        },
        selectedTodos: selectedTodos
    });
}
```

2. We need to add new handler methods to handle save, cancel, and assign-to-category button clicks.  Also, we need to enhance our onTodoEdit method to do more than just log to the console.

```javascript
// When the edit button is clicked in the TodoList
// we set the todo that was clicked as our editTodo in state.
onTodoEdit (todo) {
    this.setState({
        editTodo: {...todo}
    });
}

// When the save button is clicked....
onTodoSave (todo) {
    // We need to modify our selectedTodos to make sure it is
    // updated with the edited version of our Todo
    let selectedTodos = [{
        ...todo,
        previousCategory: null // Make this null.  We use this to identify whether the user changed the category or not
        // Remove the old version of the edited todo
    }, ...((this.state.selectedTodos && this.state.selectedTodos.filter(t => t.id !== todo.id)) || [])];

    // We also need to rebuild the todos object and insert the
    // new version of whatever category the user assigned the
    // todo to
    let todos = {
        // This removes the todos that belong to the same category as the edited todo
        ...Object.keys(this.state.todos)
            .reduce((obj, key) => {
                if (!this.state.todos[key]) return obj;
                obj[key] = this.state.todos[key].filter(t => t.id !== todo.id);
                return obj;
            }, {}),
        // This inserts a new version of the todos with the modified todo
        [todo.category]: selectedTodos
    };

    this.setState({
        todos: todos,
        selectedTodos: selectedTodos,
        // We assume that the category assigned to the edited todo is the one we want visible
        selectedCategory: this.state.categories.find(c => c.id === todo.category),
        // We're done editing, so set this to null.
        editTodo: null
    });
}

// This is called when the user cancels a Todo edit...
onTodoCancel () {
    // If the user assigned the todo to a new category, revert the change
    // and re-select the old category on the UI
    if (this.state.editTodo.previousCategory) {
        this.onCategorySelected(this.state.categories.find(c => c.id === this.state.editTodo.previousCategory))
    }

    // We're done editing, so null this out
    this.setState({
        editTodo: null,
    });
}

// When the category assignment button gets clicked...
onCategoryAssigned (newCategoryId) {
    // We copy the edit todo and change the category that it's assigned to
    // We also save the old category so we can revert the changes if the user
    // decides to cancel the change.
    let newEditTodo = {
        ...this.state.editTodo,
        previousCategory: this.state.editTodo.category,
        category: newCategoryId
    };

    // When the todo category is reassigned, we also change the 
    // selectedTodos and selectedCategory
    this.setState({
        editTodo: newEditTodo,
        selectedTodos: this.state.todos[newCategoryId],
        selectedCategory: this.state.categories.find(c => c.id === newCategoryId)
    });
}
```

3. Import our Todo Component into the App Component, bind callbacks, and add default values to state:

```javascript
// ...Omitted for brevity

// Import the Todo component
import Todo from './todo';

// ...Omitted for brevity

export default class App extends Component {
    constructor (props) {
        super(props);
       // ...Omitted for brevity

       // Bind our callbacks
        this.onTodoSave = this.onTodoSave.bind(this);
        this.onTodoCancel = this.onTodoCancel.bind(this);
        this.onCategoryAssigned = this.onCategoryAssigned.bind(this);

        // ...Omitted for brevity

        this.state = {

            // ...Omitted for brevity

            selectedTodos: null, // This is new
            editTodo: null // This is new
        };
    }
```

4. Add bindings to CategoryList and Todo.  Our App.render() method now looks like this:

```jsx
render() {
    return (
        <div>
            <MainNav />
            <div className="row">
                <div className="col-xs-12 col-sm-4">
                    <AddCategory onAddCategory={this.onAddCategory} />
                    {/* Added onCategoryAssigned and isEditMode bindings */}
                    <CategoryList categories={this.state.categories} selectedCategoryId={this.state.selectedCategory ? this.state.selectedCategory.id : null} 
                                    onCategoryExpanded={this.onCategoryExpanded} onCategoryAssigned={this.onCategoryAssigned} isEditMode={!!this.state.editTodo}
                                    onCategoryEditButtonClicked={(cat) => this.showCategoryModal(cat, true)} onCategoryDelete={this.onCategoryDelete}
                                    onCategoryAddButtonClicked={(cat) => this.showCategoryModal(cat, false)} onCategorySelected={this.onCategorySelected} />
                </div>
                <div className="col-xs-12 col-sm-8">
                    <AddTodo isDisabled={!this.state.selectedCategory} onAddTodo={this.onAddTodo} />
                    {/* Made the TodoList only visible if not in edit mode */}
                    {!this.state.editTodo && <TodoList todos={this.state.selectedTodos} onTodoChecked={this.onTodoChecked} onTodoEdit={this.onTodoEdit} />}
                    {/* Made the Todo only visible if in edit mode.  Note the Todo bindings */}
                    {this.state.editTodo && <Todo todo={this.state.editTodo} onSave={this.onTodoSave} onCancel={this.onTodoCancel} />}
                </div>
            </div>
            {this.state.showModal &&
                <CategoryModal show={true} categoryTitle={this.state.modalCategory ? this.state.modalCategory.title : null} onSave={this.onCategorySave} onClose={this.onModalClose} />}
        </div>
    );
}
```

### Make Checkbox Changes in TodoList and App Components

A note about the react-bootstrap Checkbox...When setting a default value, use defaultChecked.  Per the docs, if defaultChecked is used, you must use className of 'active'.  I realized I made this mistake in the TodoList component in a previous step.  I modified the Checkbox in that component to look like this:

```jsx
{/* ...omitted for brevity */}
<Checkbox className="checkbox active" defaultChecked={todo.isDone} onChange={(e) => this.props.onTodoChecked(todo.id, !todo.isDone)} />
{/* ...omitted for brevity */}
```

I also realized I was handling the onTodoChecked callback incorrectly in the App Component.  The problem is that I was reusing an object reference which was keeping React from noticing the change when going between the TodoList and Todo edit mode.  I modified onTodoChecked to look like this:

```javascript
onTodoChecked (id, isDone) {
    if (!this.state.selectedCategory) return;

    let selectedId = this.state.selectedCategory.id;
    let selectedTodos = this.state.todos[selectedId].map((todo) => {
        return todo.id !== id ? todo : {
            ...todo,
            isDone: isDone,
        };
    });

    this.setState({
        todos: {
            ...this.state.todos,
            [selectedId]: selectedTodos,
        },
        selectedTodos: selectedTodos
    });
}
```

### Wrap Up

In this step, we added the ability to edit todos and reassign todos to different categories.  In the next step, we will add a progress bar to track the completion of Todos.