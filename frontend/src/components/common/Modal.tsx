import React, { ReactNode } from 'react';

/**
 * Props for the Modal component.
 */
interface ModalProps {
    /** Whether the modal is visible. */
    isOpen: boolean;
    /** Function to call when trying to close the modal (overlay click). */
    onClose: () => void;
    /** Modal title. */
    title: string;
    /** Modal content. */
    children: ReactNode;
}

/**
 * Reusable layout component for displaying content in a modal dialog.
 * Handles overlay display and click-outside-to-close behavior.
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* stopPropagation prevents closing when clicking inside the modal content */}
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {children}
                </div>
                {/* Footer is handled by children mostly to keep form buttons inside form logic */}
            </div>
        </div>
    );
};

