import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { makeErrorBoundaryStyles } from './error-boundary.component.styles';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const styles = StyleSheet.create(makeErrorBoundaryStyles());

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      console.error('Error capturado por Error Boundary:', error, errorInfo);
    }
  }

  handleRestart = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Ha ocurrido un error inesperado</Text>
          <Text style={styles.message}>
            Por favor, reinicie la aplicación para continuar.
          </Text>
          <Button title="Reiniciar Aplicación" onPress={this.handleRestart} />
        </View>
      );
    }

    return this.props.children;
  }
}

