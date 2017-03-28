import './category-modal.scss';

import React, { Component } from 'react';
import { FormControl, Button, Modal } from 'react-bootstrap';

export default class CategoryModal extends Component {
    constructor (props) {
        super(props);
        this.saveCategory = this.saveCategory.bind(this);
        this.onClose = this.onClose.bind(this);
    }

    render () {
        return (
            <Modal show={this.props.show} onHide={this.onClose} className="category-modal">
                <Modal.Header closeButton>
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

    onClose () {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }
}