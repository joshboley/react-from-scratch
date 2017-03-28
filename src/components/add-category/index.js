import './add-category.scss';

import React, { Component } from 'react';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';

export default class AddCategory extends Component {
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

    addCategory (e) {
        e.preventDefault();
        this.props.onAddCategory(e.target.category_name.value);
        e.target.reset();
    }
}