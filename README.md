# react-from-scratch

A demo of setting up a react app in steps (see feature branches for the steps)

## Step 4

In step 4, we will modify our categories and todos so that todos must be added to the currently selected category.

---

### Modify CategoryList

First, we need to modify the CategoryList component.  We need to add a way to click a category and highlight it to show that it's active.  Todo this, we will do two things:

1. Add a `<div>` inside the ListGroupItem tag in the CategoryList component that binds click events to the onCategorySelected callback passed via `props`.
2. Add a classname of `active` to the ListGroupItem when it is clicked.

```jsx
    {/* ... omitted for brevity */}
    <ListGroupItem key={category.id} className={"category-item clearfix " + (this.props.selectedCategoryId === category.id ? "active" : "")}>
        <div className="clickable-area" onClick={e => this.props.onCategorySelected(category)}></div>
        {/* ... omitted for brevity */}
```

Here is the css I'm using to style this.  You can style yours how you like:

```css
.category-list-component {
    .category-list {
        width: 100%;
        float: left;
        margin-top: 10px;

        .category-item {
            padding: 10px;
            border: none;
            position: relative;

            &.active {
                background-color: #e4e4e4;
                color: #000;
            }

            .clickable-area {
                width: 100%;
                height: 100%;
                display: inline-block;
                cursor: pointer;
                position: absolute;
                top: 0;
                left: 0;
            }

            .pull-right {
                padding-right: 10px;
            }

            span {
                margin: 0 10px;
                font-size: 16px;
                font-weight: bold;
            }
        }
    }
}
```

### Make changes to App Component

Now that we've made the CategoryList selectable, we need to add the callbacks and bindings in the App component:

1. Add a class method to the App component to pass to the CategoryList via props:

```javascript
// When a category is selected, we will add that category to the state and add its Todos to the state
// as selectedTodos
onCategorySelected (category) {
    this.setState({
        selectedCategory: category,
        selectedTodos: this.state.todos[category.id]
    });
}
```

2. In the class constructor, bind `this` and add the new state initializations:

```javascript
    constructor (props) {
        super(props);
        // ... omitted for brevity
        this.onCategorySelected = this.onCategorySelected.bind(this);
 
        this.state = {
            todos: {}, // Change todos from an array to an object.  The keys of the object will be the category id for easy access.  The values will be arrays of todos
            categories: [],
            showModal: false,
            modalCategory: null,
            modalParentCategory: null,
            selectedCategory: null, // Initialize as null
            selectedTodos: null // Initialize as null
        };
```

3. Bind `selectedCategoryId` prop and `onCategorySelected` to the CategoryList component.  The CategoryList usage in the App's render method should now look like this:

```jsx
// Inside App.render()
<CategoryList categories={this.state.categories} 
    selectedCategoryId={this.state.selectedCategory ? this.state.selectedCategory.id : null} onCategoryExpanded={this.onCategoryExpanded} 
    onCategoryEditButtonClicked={(cat) => this.showCategoryModal(cat, true)} onCategoryDelete={this.onCategoryDelete}
    onCategoryAddButtonClicked={(cat) => this.showCategoryModal(cat, false)} onCategorySelected={this.onCategorySelected} />
```

4. Since we are setting state.selectedTodos in our state when a category is clicked, we now want to bind that property to our TodoList instead of state.todos:

```jsx
// Inside App.render()
<TodoList todos={this.state.selectedTodos} onTodoChecked={this.onTodoChecked} onTodoEdit={this.onTodoEdit} />
```

*Note:* This creates the possibility that `state.selectedTodos` could be null.  Therefore, we need to modify the TodoList component to handle null prop values:

```jsx
render () {
    return (
        <ListGroup className="todo-list">
            {/* Adding this.props.todos && allows us to short circuit this to avoid null reference errors. */}
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
```

*Note:* We also realized that we only want our Add Todo text box to work if the user has selected a category.  Therefore, in the App Component's render method, we bind an `isDisabled` property to the AddTodo component:

```jsx
<AddTodo isDisabled={!this.state.selectedCategory} onAddTodo={this.onAddTodo} />
```

Also, we need to update the AddTodo component to make use of the `isDisabled` prop:

```jsx
// Inside AddTodo
render () {
    return (
        <form className="add-todo" onSubmit={this.addTodo}>
            <FormGroup className="clearfix">
                <InputGroup>
                    <FormControl name="todo_name" type="text" placeholder="Add Todo" />
                    <InputGroup.Button>
                        {/* Add disabled attribute */}
                        <Button type="submit" disabled={this.props.isDisabled}>Add</Button>
                    </InputGroup.Button>    
                </InputGroup>
            </FormGroup>
        </form>
    );
}

addTodo (e) {
    let val = e.target.todo_name.value;
    e.preventDefault();

    // Make sure the user enters a non-empty string
    if (!val || val.trim() === '') return;

    this.props.onAddTodo(val);
    e.target.reset();
}
```

5. Back in our App Component class, we need to modify the onAddTodo method to handle the new object todos structure (Recall that in previous steps, it was an array) and add todos to the currently selected category:

```javascript
onAddTodo (value) {
    // If the user has not selected a category, do nothing
    if (!this.state.selectedCategory) return;

    // Add the new todo to the beginning of the array
    // of the selectedTodos (meaning the todos that belong to the currently selected category)
    let selectedTodos = [{
        id: guid(),
        title: value,
        isDone: false,
        description: null
    }, ...(this.state.selectedTodos || [])];

    this.setState({
        todos: {
            ...this.state.todos,
            // Set the selected category's todos to be our
            // newly created selectedTodos array
            [this.state.selectedCategory.id]: selectedTodos
        },
        // Make sure to also reset selectedTodos or else the new item won't show on the screen
        selectedTodos: selectedTodos
    });
}
```

6. In our App component, we need to modify the onCategoryDelete method to delete associated todos and also set selectedCategory and selectedTodos to null if the delelted category was also the currently selected category:

```javascript
onCategoryDelete (id) {
    // Our selected category was the one that was deleted if the id passed to this method matches the selectedCategory id
    let wasSelectedCategoryDeleted = this.state.selectedCategory && this.state.selectedCategory.id === id;

    this.setState({
        // This is the only original part of our onCategoryDelete method.  It remains unchanged.
        categories: this.deleteCategory(id, this.state.categories),
        // Filter out any todos belonging to the deleted category
        todos: Object.keys(this.state.todos)
                .filter(key => key !== id)
                .reduce((obj, key) => {
                    obj[key] = this.state.todos[key];
                    return obj;
                }, {}),
        // Set selected category and todos to null if the selected category was deleted
        selectedCategory: wasSelectedCategoryDeleted ? null : this.state.selectedCategory,
        selectedTodos: wasSelectedCategoryDeleted ? null : this.state.selectedTodos
    });
}
```

### Wrap Up

In this step, we added the ability to add todos to categories.  In the next step, we will add the ability to edit our Todos and to change the Category that they are assigned to.  We will also add a progress bar to track the completion of Todos.