import React from 'react';
import PropTypes from 'prop-types';

const EmptyState = ({
    icon = '📭',
    title = 'Nothing here yet',
    description = 'Check back later for updates.',
    actionText,
    onAction
}) => {
    return (
        <div className="empty-state">
            <div className="empty-state-icon">
                {icon}
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {actionText && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );
};

EmptyState.propTypes = {
    icon: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    actionText: PropTypes.string,
    onAction: PropTypes.func
};

export default EmptyState;
