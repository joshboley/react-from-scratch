import React, { Component } from 'react';

import guid from '../util/guid';

import MainNav from './main-nav';
import AddTodo from './add-todo';
import TodoList from './todo-list';
import AddCategory from './add-category';
import CategoryList from './category-list';
import CategoryModal from './category-modal';

export default class App extends Component {
    constructor (props) {
        super(props);
        this.onAddTodo = this.onAddTodo.bind(this);
        this.onTodoChecked = this.onTodoChecked.bind(this);
        this.onTodoEdit = this.onTodoEdit.bind(this);
        this.onAddCategory = this.onAddCategory.bind(this);
        this.onCategoryExpanded = this.onCategoryExpanded.bind(this);
        this.onCategoryDelete = this.onCategoryDelete.bind(this);
        this.deleteCategory = this.deleteCategory.bind(this);
        this.showCategoryModal = this.showCategoryModal.bind(this);
        this.onCategorySave = this.onCategorySave.bind(this);
        this.addOrEditCategory = this.addOrEditCategory.bind(this);
        this.onModalClose = this.onModalClose.bind(this);
        this.onCategorySelected = this.onCategorySelected.bind(this);

        this.state = {
            todos: {},
            categories: [],
            showModal: false,
            modalCategory: null,
            modalParentCategory: null,
            selectedCategory: null,
            selectedTodos: null
        };
    }

    render() {
        return (
            <div>
                <MainNav />
                <div className="row">
                    <div className="col-xs-12 col-sm-4">
                        <AddCategory onAddCategory={this.onAddCategory} />
                        <CategoryList categories={this.state.categories} selectedCategoryId={this.state.selectedCategory ? this.state.selectedCategory.id : null} onCategoryExpanded={this.onCategoryExpanded} 
                                      onCategoryEditButtonClicked={(cat) => this.showCategoryModal(cat, true)} onCategoryDelete={this.onCategoryDelete}
                                      onCategoryAddButtonClicked={(cat) => this.showCategoryModal(cat, false)} onCategorySelected={this.onCategorySelected} />
                    </div>
                    <div className="col-xs-12 col-sm-8">
                        <AddTodo isDisabled={!this.state.selectedCategory} onAddTodo={this.onAddTodo} />
                        <TodoList todos={this.state.selectedTodos} onTodoChecked={this.onTodoChecked} onTodoEdit={this.onTodoEdit} />
                    </div>
                </div>
                {this.state.showModal &&
                 <CategoryModal show={true} categoryTitle={this.state.modalCategory ? this.state.modalCategory.title : null} onSave={this.onCategorySave} onClose={this.onModalClose} />}
            </div>
        );
    }

    onAddTodo (value) {
        if (!this.state.selectedCategory) return;

        let selectedTodos = [{
            id: guid(),
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

    onTodoChecked (id, isDone) {
        this.setState({
            todos: this.state.todos.map((todo) => {
                return todo.id !== id ? todo : {
                    ...todo,
                    isDone: isDone,
                };
            }),
        });
    }

    onTodoEdit (todo) {
        console.log('Edit Todo:', todo);
    }

    onAddCategory (value, parentId) {
        this.setState({
            categories: [{
                id: guid(),
                title: value,
                parent: parentId || null,
                children: [],
                isDone: false,
                isExpanded: false,
            }, ...this.state.categories],
        });
    }

    onCategoryExpanded (id, isExpanded) {
        this.setState({
            categories: this.setCategoryExpanded(id, this.state.categories, isExpanded)
        });
    }

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

    onCategoryDelete (id) {
        let wasSelectedCategoryDeleted = this.state.selectedCategory && this.state.selectedCategory.id === id;

        this.setState({
            categories: this.deleteCategory(id, this.state.categories),
            todos: Object.keys(this.state.todos)
                .filter(key => key !== id)
                .reduce((obj, key) => {
                    obj[key] = this.state.todos[key];
                    return obj;
                }, {}),
            selectedCategory: wasSelectedCategoryDeleted ? null : this.state.selectedCategory,
            selectedTodos: wasSelectedCategoryDeleted ? null : this.state.selectedTodos
        });
    }

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

    onCategorySave (value) {
        let isEdit = this.state.modalCategory ? true : false;
        let id = isEdit ? this.state.modalCategory.id : this.state.modalParentCategory.id;
        this.setState({
            categories: this.addOrEditCategory(id, this.state.categories, value, isEdit)
        });
    }

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

    showCategoryModal (category, isEdit) {
        this.setState({
            showModal: true,
            modalCategory: isEdit ? category : null,
            modalParentCategory: isEdit ? null : category,
        });
    }

    onModalClose () {
        this.setState({
            showModal: false,
            modalCategory: null,
            modalParentCategory: null,
        })
    }

    onCategorySelected (category) {
        this.setState({
            selectedCategory: category,
            selectedTodos: this.state.todos[category.id]
        });
    }
}