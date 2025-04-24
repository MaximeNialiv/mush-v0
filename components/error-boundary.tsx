"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"
import * as Sentry from "@sentry/nextjs"

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(error: Error): State {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de secours
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erreur capturée par ErrorBoundary:", error, errorInfo)
    
    // Capturer l'erreur avec Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    })
  }

  public render() {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle UI de secours
      return this.props.fallback || (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-bold text-red-700 mb-2">Une erreur est survenue</h2>
          <p className="text-red-600 mb-4">
            {this.state.error?.message || "Quelque chose s'est mal passé."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
