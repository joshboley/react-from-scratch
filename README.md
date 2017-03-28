# react-from-scratch

A demo of setting up a react app in steps (see feature branches for the steps)

## Step 3

In step 3, we will create components that allow us to add Categories to a Category list.  Also, Category lists can be infinitely nested.  Therefore, each Category will have an array called `children` which can hold its own nested Categories.  Categories will be able to be added, edited, and deleted.  For now, we will not tie Todos to Categories.  We will do that in a later step.

---

### Create an AddCategory Component

First, we need to create a simple AddCategory component that will allow the user to enter a Category name/title and pass that name to the parent component when the add button is clicked.  This component will only be responsible for adding top-level Categories.  We will use the CategoryList component (see below) to add nested Categories.

1. Create an `add-category` directory `mkdir add-category`
2. Create an `add-categroy.scss` file for our styles (style it however you like).
3. Create an `index.js` file inside the directory. *Note:* We name the file index.js so that we can import it as `import AddCategory from './add-category'`.  If we named the file `add-category.js` we would have to do `import AddCategory from './add-category/add-category'`.

```sh
cd add-category
touch index.js
```

4. Add the following code:

```jsx
import './add-category.scss'; // import our styles for webpack to pick up

import React, { Component } from 'react';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';

export default class AddCategory extends Component {
    // In the constructor, we call super to have access to `this`.
    // We also find certain function to `this` for use inside event handlers
    constructor (props) {
        super(props);
        this.addCategory = this.addCategory.bind(this);
    }

    render () {
        return (
            <form className="add-category" onSubmit={this.addCategory}>
                <FormGroup className="clearfix">
                    <InputGroup>
                        <FormControl name="category_name" type="text" placeholder="Add Category" />
                        <InputGroup.Button>
                            <Button type="submit">Add</Button>
                        </InputGroup.Button>    
                    </InputGroup>
                </FormGroup>
            </form>
        );
    }

    // addCategory gets called on form submit via the onSubmit event binding
    addCategory (e) {
        e.preventDefault();
        // Access the input value and pass it to onAddCategory (which is passed from the parent via props)
        this.props.onAddCategory(e.target.category_name.value);
        // Reset the form field(s)
        e.target.reset();
    }
}
```

### Add Some Helpful Utilities

Before we continue further, let's add in some items that will come in handy later.

1. First of all, let's add a `util` directory to the `/src` directory.  Then, add a file inside `/util` called `guid.js` with the following code:

```javascript
// This is a function that more or less generates a guid for us.  We will use this later to
// dynamically generate IDs for our Categories and Todos so that they will be random and not collide.
// Note:  This code was taken from http://stackoverflow.com/a/2117523 for convenience.
export default function guid () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
```

2. Let's add Babel support for the Object Spread Operator.  This will allow us to quickly mutate state without manually copying all of our property names over and over.  To see how this works, check out the [Babel Docs](https://babeljs.io/docs/plugins/transform-object-rest-spread/)  To do this, we need to do 2 things.
    * `npm install --save-dev babel-preset-stage-2` -- This is a Babel preset that holds the object spread operator functionality.
    * Modify our `.babelrc` file to add the stage-2 preset:

```javascript
{
    "presets": [
        "react",
        "es2015",
        "react-hmre",
        "stage-2" // Add stage-2 for object spread operator support
    ],
    "ignore": "/node_modules/"
}
```

### Create a CategoryList Component

Next, we need to create a CategoryList component that will accept a list of categories and bind several callbacks for the different buttons on the list.  We will have the following buttons on the each Category in the CategoryList that will need to be bound:

* Expand child (nested) Categories button.  When clicked, this will show the nested child Categories that belong to this Category.  Each level of nested Categories will be indented a certain amount by our css.
* Edit Category button.  When clicked, this will show the Add/Edit Category modal.  This modal will allow the user to edit the Category title and save the change.
* Add Category button.  When clicked, this will show the Add/Edit Category modal.  This modal will allow the user to edit the Category title and save the change.  When this button is used to add a Category, the new Category will belong (be nested within) the Category whose 'Add' button was clicked.
* Delete Category button.  When clicked, this will remove the clicked Category and all of its children.

Now, to add our CategoryList Component:

1. Create a `category-list` directory `mkdir category-list`
2. Create a `category-list.scss` file for our styles (style it however you like).
3. Create an `index.js` file inside the directory. See above note for why we name it `index.js`
4. Add the following code to `index.js`:

```jsx
import './category-list.scss'; // import our scss for webpack to pick up

import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';

export default class CategoryList extends Component {
    constructor (props) {
        super(props);
    }

    // Our render function is pretty sparse.  The reason for this is because we have to use
    // recursion to build our nested Category list from each category's 'children' property.
    render () {
        return (
            <div className="category-list-component">
                {this.renderCategories(this.props.categories)}
            </div>
        );
    }

    // The first time this gets called, it is passed 'this.props.categories'.  Each subsequent time, it is passed the 'children' property of each category
    // Notice that in each of our click handlers, we are simply called function callbacks that were passed via props.  There is no internal state handling being done.
    renderCategories (categories) {
        return (
            <ListGroup className="category-list">
                {categories.map((category) => {
                    return (
                        <ListGroupItem key={category.id} className="category-item clearfix">
                            <div className="pull-left">
                                <Button className={"glyphicon glyphicon-chevron-" + (category.isExpanded ? "down" : "right")} 
                                        onClick={(e) => this.props.onCategoryExpanded(category.id, !category.isExpanded)} />
                                <span>{category.title}</span>
                                <Button className="glyphicon glyphicon-edit" onClick={(e) => this.props.onCategoryEditButtonClicked(category)} />
                            </div>
                            <div className="pull-right">
                                <Button className="glyphicon glyphicon-trash" onClick={(e) => this.props.onCategoryDelete(category.id)} />
                                <Button className="glyphicon glyphicon-plus" onClick={(e) => this.props.onCategoryAddButtonClicked(category)} />
                            </div>
                            {/* Only make the recursive call if the category has children and the use has clicked the 'expand' button for this category */}
                            {category.isExpanded && category.children && category.children.length > 0 && this.renderCategories(category.children)}
                        </ListGroupItem>
                    );
                })}
            </ListGroup>
        );
    }
}
```

### Create a CategoryModal Component

Next, we need to create a CategoryModal component that will simply accept props and bind them to the view and call callbacks when the user clicks buttons.  Once again, we are not handling any state internally in this component.

1. Create a `category-modal` directory `mkdir category-modal`
2. Create a `category-modal.scss` file for our styles (style it however you like).
3. Create an `index.js` file inside the directory. See above note for why we name it `index.js`
4. Add the following code to `index.js`:

```jsx
import './category-modal.scss'; // import our scss for webpack to pick up later

import React, { Component } from 'react';
import { FormControl, Button, Modal } from 'react-bootstrap';

export default class CategoryModal extends Component {
    // In the constructor, we call super to have access to `this`.
    // We also find certain function to `this` for use inside event handlers
    constructor (props) {
        super(props);
        this.saveCategory = this.saveCategory.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    render () {
        return (
            // Use bootstrap's Modal component to hide/show the modal
            <Modal show={true} onHide={this.onClose} className="category-modal">
                <Modal.Header closeButton>
                    {/* If there is not title, assume we are doing an add */}
                    <Modal.Title>{this.props.categoryTitle || 'Add Category'}</Modal.Title>
                </Modal.Header>
                <form onSubmit={this.saveCategory}>
                    <Modal.Body>
                        <FormControl name="category_name" type="text" placeholder="Category Title" defaultValue={this.props.categoryTitle || undefined} autoFocus />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit">Save</Button>
                    </Modal.Footer>
                </form>
            </Modal>
        );
    }

    saveCategory (e) {
        e.preventDefault();
        this.props.onSave(e.target.category_name.value);
        e.target.reset();
        this.onClose();
    }

    // We've made onClose an optional prop, so only call the function if it's defined.
    onClose () {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }
}
```

### Modify App Component to Handle State

Now that we've created the added our 3 new components, let's go ahead an set up our root App component to manage the state changes.  For now, this will make App.js a little complicated, especially because of the recursive nature of the Categories.  Just remember, we will move all of this state management to Redux in a later step and adding Routing will help as well.  Here are the disclaimers we saw in Step-2 reiterated:

1. We are currently going to be managing state in our root App component.  This is only temporary.  In later steps, we will transition to using connected components via Redux to manage state and event bindings.
2. Our components in the /components directory are 'dumb' components. They don't deal with managing state.  They simply accept props and use those props to create their functionality and diplay values. Any value that needs to be displayed is accessed via `this.props` and any event or change in a value is handled via a function that was passed to the component itself via `this.props`.  This is very important and will not change in subsequent steps.  In later steps, we will transition to using connected components that will bind themselves to the redux store and then pass state to 'dumb' components via props.  These connected components will not live inside the /components directory to maintain a separation of concerns for different component types.

Add some class methods to the App component.  These will handle changes for adding, editing, expanding, and showing the modal for Categories:

```javascript
// When a category is added to the top level, we use this simple add to add a new category to the beginning of the list
onAddCategory (value, parentId) {
    this.setState({
        categories: [{
            id: guid(),
            title: value, // User-entered value
            parent: parentId || null, // If the category happened to be nested, we would add a parent id here
            children: [], // The category's children will live inside this array
            isDone: false, // This will be used later for removing a category from the list when all of its tasks are marked 'done'
            isExpanded: false, // This will be used to handle whether the category is expanded in the UI or not.
        }, ...this.state.categories],
    });
}

// When a category's expand button is clicked, we set it's isExpanded property 
onCategoryExpanded (id, isExpanded) {
    this.setState({
        categories: this.setCategoryExpanded(id, this.state.categories, isExpanded)
    });
}

// This recursively finds the category for expansion by id and set's it's isExpanded property
setCategoryExpanded (id, categories, isExpanded) {
    return categories.map(category => {
        if (category.id === id) {
            return {
                ...category,
                isExpanded: isExpanded
            };
        } else if (category.children && category.children.length) {
            return {
                ...category,
                children: this.setCategoryExpanded(id, category.children, isExpanded)
            };
        } else {
            return category;
        }
    });
} 

// this gets called when a category's 'delete' button gets clicked.
onCategoryDelete (id) {
    this.setState({
        categories: this.deleteCategory(id, this.state.categories)
    });
}

// This recursively finds a category by id and deletes it and all of its children
deleteCategory (id, categories) {
    return categories.filter(category => {
        if (category.id === id) {
            return false;
        } else if (category.children && category.children.length) {
            category.children = this.deleteCategory(id, category.children);
        }

        return true;
    });
}

// Gets called when a category 'save' button is clicked
onCategorySave (value) {
    // If there is a modalCategory set in state, we assume we are in edit mode
    let isEdit = this.state.modalCategory ? true : false;
    // If we are in edit mode, the id we will use if the category's own id.  Otherwise,
    // it means we are adding a child to the category specified in modalParentCategory.
    let id = isEdit ? this.state.modalCategory.id : this.state.modalParentCategory.id;
    this.setState({
        categories: this.addOrEditCategory(id, this.state.categories, value, isEdit)
    });
}

// Recursively finds a category by id.  If it is in edit more, it sets the new title of the category.
// If it is not in edit mode, it adds a new category with the given title to the category whose id matches the one provided.
addOrEditCategory (id, categories, newCategoryTitle, isEdit) {
    return categories.map(category => {
        if (!isEdit && category.id === id) {
            return {
                ...category,
                children: [{
                    id: guid(),
                    title: newCategoryTitle,
                    parent: category.id,
                    children: [],
                    isDone: false,
                    isExpanded: false,
                }, ...category.children]
            };
        } else if (isEdit && category.id === id) {
            return {
                ...category,
                title: newCategoryTitle
            };
        } else if (category.children && category.children.length) {
            return {
                ...category,
                children: this.addOrEditCategory(id, category.children, newCategoryTitle, isEdit)
            };
        } else {
            return category;
        }
    });
}

// Gets called when the user clicks either add or edit on the Category list
// If in edit mode, the modalCategory gets set.
// If not in edit mode, the modalParentCategory gets set
showCategoryModal (category, isEdit) {
    this.setState({
        showModal: true,
        modalCategory: isEdit ? category : null,
        modalParentCategory: isEdit ? null : category,
    });
}

// When the modal is closed, we reset certain state parameters
onModalClose () {
    this.setState({
        showModal: false,
        modalCategory: null,
        modalParentCategory: null,
    })
}
```

Next, we need to import our components into the App component:

```javascript
import guid from '../util/guid';

import AddCategory from './add-category';
import CategoryList from './category-list';
import CategoryModal from './category-modal';
```

We need to modify the App component constructor to do several things:

```javascript
constructor (props) {
    super(props);
    this.onAddCategory = this.onAddCategory.bind(this);
    this.onCategoryExpanded = this.onCategoryExpanded.bind(this);
    this.onCategoryDelete = this.onCategoryDelete.bind(this);
    this.deleteCategory = this.deleteCategory.bind(this);
    this.showCategoryModal = this.showCategoryModal.bind(this);
    this.onCategorySave = this.onCategorySave.bind(this);
    this.addOrEditCategory = this.addOrEditCategory.bind(this);
    this.onModalClose = this.onModalClose.bind(this);

    this.state = {
        todos: [], // This existed from Step-2
        categories: [],
        showModal: false,
        modalCategory: null,
        modalParentCategory: null
    };
}
```

This accomplishes the following:

1. The call to super() allows us to use `this` correctly in the constructor
2. We bind `this` to our class methods that will be passed to the child components (see below)
3. Initializes `this.state`

Finally, we modify our App render method to handle our new components (`<AddCategroy>`, `CategroyList`, `<CategoryModal>`) and bind their props and callbacks.  Our final render method should look like this:

```jsx
render() {
    return (
        <div>
            <MainNav />
            <div className="row">
                <div className="col-xs-12 col-sm-4">
                    <AddCategory onAddCategory={this.onAddCategory} />
                    <CategoryList categories={this.state.categories} onCategoryExpanded={this.onCategoryExpanded} 
                                    onCategoryEditButtonClicked={(cat) => this.showCategoryModal(cat, true)} onCategoryDelete={this.onCategoryDelete}
                                    onCategoryAddButtonClicked={(cat) => this.showCategoryModal(cat, false)} />
                </div>
                <div className="col-xs-12 col-sm-8">
                    <AddTodo onAddTodo={this.onAddTodo} />
                    <TodoList todos={this.state.todos} onTodoChecked={this.onTodoChecked} onTodoEdit={this.onTodoEdit} />
                </div>
            </div>
            {/* Only insert the modal if our state's showModal is true */}
            {this.state.showModal &&
                <CategoryModal show={true} categoryTitle={this.state.modalCategory ? this.state.modalCategory.title : null} onSave={this.onCategorySave} onClose={this.onModalClose} />}
        </div>
    );
}
```

### Wrap Up

In this step, we added the ability to add Categories to a Category list and edit/delete them.  In subsequent steps, we will add the ability to categorize Todos and refactor the code to use Redux and the React Router to simplify state management.