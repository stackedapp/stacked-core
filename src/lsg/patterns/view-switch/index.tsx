import { colors } from '../colors';
import { CopySize } from '../copy';
import { Icon, IconName, IconProps, IconSize } from '../icons';
import * as React from 'react';
import { getSpace, SpaceSize } from '../space';
import styled from 'styled-components';

export type JustifyType = 'start' | 'center' | 'end' | 'stretch';

export interface ViewSwitchProps {
	fontSize?: CopySize;
	justify?: JustifyType;
	leftVisible: boolean;
	onLeftClick?: React.MouseEventHandler<SVGElement>;
	onRightClick?: React.MouseEventHandler<SVGElement>;
	rightVisible: boolean;
	title: string;
}

export interface ViewTitleProps {
	fontSize?: CopySize;
	justify?: JustifyType;
	title: string;
}

interface StyledIconProps extends IconProps {
	visible: boolean;
}

interface StyledViewSwitchProps {
	fontSize?: CopySize;
	justify?: 'start' | 'center' | 'end' | 'stretch';
}

const StyledViewSwitch = styled.div`
	display: flex;
	align-self: center;
	justify-self: ${(props: StyledViewSwitchProps) => props.justify || 'start'};
	font-size: ${(props: StyledViewSwitchProps) =>
		props.fontSize ? `${props.fontSize}px` : `${CopySize.S}px`};
`;

const StyledTitle = styled.strong`
	position: relative;
	align-self: center;
	display: inline-block;
	width: 130px;
	margin: 0 ${getSpace(SpaceSize.XS)}px;
	overflow: hidden;
	color: ${colors.grey36.toString()};
	font-size: inherit;
	font-weight: normal;
	text-align: center;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

const StyledIcons = styled(Icon)`
	padding: ${getSpace(SpaceSize.XXS)}px;
	border-radius: ${getSpace(SpaceSize.XXS)}px;
	visibility: ${(props: StyledIconProps) => (props.visible ? 'visible' : 'hidden')};
	cursor: pointer;
	pointer-events: auto;

	&:hover {
		background: ${colors.grey90.toString()};
	}
`;

export const ViewTitle: React.StatelessComponent<ViewTitleProps> = (props): JSX.Element => (
	<StyledViewSwitch justify={props.justify} fontSize={props.fontSize}>
		<StyledTitle>{props.title}</StyledTitle>
	</StyledViewSwitch>
);

export const ViewSwitch: React.StatelessComponent<ViewSwitchProps> = (props): JSX.Element => (
	<StyledViewSwitch justify={props.justify} fontSize={props.fontSize}>
		<StyledIcons
			color={colors.grey60}
			onClick={props.onLeftClick}
			size={IconSize.XS}
			name={IconName.ArrowLeft}
			visible={props.leftVisible}
		/>
		<StyledTitle>{props.title}</StyledTitle>
		<StyledIcons
			color={colors.grey60}
			onClick={props.onRightClick}
			size={IconSize.XS}
			name={IconName.ArrowRight}
			visible={props.rightVisible}
		/>
	</StyledViewSwitch>
);
