import SunFi from "@/components/shared/SunFi.jsx"
import { render, screen } from '../unit/test-utils.tsx'; // Utilise le wrapper personnalisé
import React from "react";

test('renders SunFi component', () => {
    render(<SunFi />);
    expect(screen.getByText('Adminstration des clients')).toBeInTheDocument();
});