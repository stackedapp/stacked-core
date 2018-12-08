import * as Mobx from 'mobx';
import * as MobxReact from 'mobx-react';
import { partition, groupBy } from 'lodash';
import { PropertyListItem } from './property-list-item';
import * as React from 'react';
import { ViewStore } from '../../store';
import * as Types from '../../types';
import * as Model from '../../model';
import * as Components from '../../components';

@MobxReact.inject('store')
@MobxReact.observer
export class PropertyListContainer extends React.Component {
	@Mobx.observable private detailsOpen = false;

	@Mobx.action
	private toggleOpen = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		this.detailsOpen = !this.detailsOpen;
	};

	public render(): React.ReactNode {
		const { store } = this.props as { store: ViewStore };
		const selectedElement = store.getSelectedElement();

		if (!selectedElement) {
			return null;
		}

		const [eventHandlerProps, props] = partition(
			selectedElement.getProperties(),
			isPropertyType(Types.PatternPropertyType.EventHandler)
		);

		const [unknownProps, regularProps] = partition(
			props,
			isPropertyType(Types.PatternPropertyType.Unknown)
		);

		const [groupedProps, ungroupedProps] = partition(regularProps, isGrouped(true));

		const groupedPropsObject = groupBy(groupedProps, elementProperty =>
			elementProperty.getGroup()
		);
		const groupedPropsKeys = Object.keys(groupedPropsObject);
		const groupedPropsValues = Object.values(groupedPropsObject);

		return (
			<div>
				{ungroupedProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				{groupedPropsKeys.map((groupName, groupIndex) => (
					<Components.PropertyDetails
						open={this.detailsOpen}
						onClick={this.toggleOpen}
						key={groupName}
						summary={
							<Components.Copy size={Components.CopySize.S}>{groupName}</Components.Copy>
						}
					>
						{groupedPropsKeys.map((key, propertyIndex) => (
							<PropertyListItem
								key={groupedPropsValues[groupIndex][propertyIndex].getId()}
								property={groupedPropsValues[groupIndex][propertyIndex]}
							/>
						))}
					</Components.PropertyDetails>
				))}
				{eventHandlerProps.map(elementProperty => (
					<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
				))}
				{unknownProps.length > 0 && (
					<Components.PropertyDetails
						open={this.detailsOpen}
						onClick={this.toggleOpen}
						summary={
							<div>
								<Components.Headline type="primary" order={4}>
									Code Properties
								</Components.Headline>
								<Components.Space sizeBottom={Components.SpaceSize.XS} />
								<Components.Copy>This component accepts code properties</Components.Copy>
							</div>
						}
					>
						{unknownProps.map(elementProperty => (
							<PropertyListItem key={elementProperty.getId()} property={elementProperty} />
						))}
					</Components.PropertyDetails>
				)}
			</div>
		);
	}
}

function isPropertyType(type: Types.PatternPropertyType): (p: Model.ElementProperty) => boolean {
	return p => {
		const patternProperty = p.getPatternProperty();
		return typeof patternProperty !== 'undefined' && patternProperty.getType() === type;
	};
}

function isGrouped(grouped: boolean): (p: Model.ElementProperty) => boolean {
	return p => {
		const patternProperty = p.getPatternProperty();
		const hasGroup = typeof patternProperty !== 'undefined' && patternProperty.getGroup() !== '';
		return typeof patternProperty !== 'undefined' && hasGroup === grouped;
	};
}
