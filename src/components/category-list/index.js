import './category-list.scss';

import React, { Component } from 'react';
import { ListGroup, ListGroupItem, Button } from 'react-bootstrap';

export default class CategoryList extends Component {
    constructor (props) {
        super(props);
    }

    render () {
        return (
            <div className="category-list-component">
                {this.renderCategories(this.props.categories)}
            </div>
        );
    }

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
                                <Button className="glyphicon glyphicon-edit" onClick={(e) => this.props.onCategoryEditButtonClicked(category)} />
                            </div>
                            <div className="pull-right">
                                <Button className="glyphicon glyphicon-trash" onClick={(e) => this.props.onCategoryDelete(category.id)} />
                                <Button className="glyphicon glyphicon-plus" onClick={(e) => this.props.onCategoryAddButtonClicked(category)} />
                            </div>
                            {category.isExpanded && category.children && category.children.length > 0 && this.renderCategories(category.children)}
                        </ListGroupItem>
                    );
                })}
            </ListGroup>
        );
    }
}