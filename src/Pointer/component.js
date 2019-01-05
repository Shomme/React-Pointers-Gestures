import React from 'react'
import { findDOMNode } from 'react-dom'
import { Fragment } from 'react'
import EventEmitter from 'events'
import updateSession from './engine/update-session'
import { calcMainAngle, calcCenter, calcDistance, calcRadius } from './engine/helpers'
import { handlePan, handlePinch, handlePress, handleDoubleTap } from './engine/gesture-handlers'
import { handleAdd, handleMove, handleRemove } from './engine/basic-event-handlers'

const emptyFunction = () => undefined

const gestureSettings = {
	pressTimer: 500,
	pressDistance: 20,
	tapTimer: 150,
	tapDistance: 20,
	doubleTapTimer: 300,
	doubleTapDistance: 20,
	panStartDistance: 20,

	rotatePositionThreshold: 8,
	rotateDistanceThreshold: 300,
	scalePositionThreshold: 0.07,
	scaleDistanceThreshold: 0.15,
	thresholdResetTimer: 1000,
	thresholdResetCoeff: 0
}


export default class Pointer extends React.Component {
	constructor(props) {
		super(props)

		this.pointersState = {
			activePointers: {},
			pointersLength: 0,
			lastTap: {},
			session: {
				startX: 0,
				startY: 0,
				startAngle: 0,
				startRadius: 0,
				startTime: 0
			},
			currentCenter: 0,
			currentAngle: 0,
			currentTimeStamp: 0,
			currentRadius: 0,
			rotationDistance: 0,
			scaleDistance: 0
		}

		Object.defineProperty(this.pointersState.activePointers, 'length', {
			value: 0,
			enumerable: false,
			writable: true,
			configurable: true
		})

		this.ee = new EventEmitter()

		// TODO: Добавить декоратор bind (Аскар)
		this.addPointerToTracking = this.addPointerToTracking.bind(this)
		this.removePointerFromTracking = this.removePointerFromTracking.bind(this)
		this.recalc = this.recalc.bind(this)
		this.clearPointers = this.clearPointers.bind(this)

		this.updateSession = updateSession.bind(this)

		this.handlePan = handlePan.bind(this)
		this.handlePinch = handlePinch.bind(this)
		this.handlePress = handlePress.bind(this)
		this.handleDoubleTap = handleDoubleTap.bind(this)

		this.handleRemove = handleRemove.bind(this)
		this.handleMove = handleMove.bind(this)
		this.handleAdd = handleAdd.bind(this)

		this.pressTimer = 500
		this.pressDistance = 20
		this.tapTimer = 150
		this.tapDistance = 20
		this.doubleTapTimer = 150
		this.doubleTapDistance = 20

		this.pinchRotateThreshold = 2.5
		this.thresholdResetTimer = 300
		this.thresholdResetCoeff = 0.5

		Object.assign(this, gestureSettings)
	}

	componentDidMount() {
		this.container = findDOMNode(this)
		this.container.addEventListener('touchmove', this.recalc)
		this.container.addEventListener('touchstart', this.addPointerToTracking)
		this.container.addEventListener('touchend', this.removePointerFromTracking)
		this.container.addEventListener('mousedown', this.addPointerToTracking)
		document.body.addEventListener('mousemove', this.recalc)
		document.body.addEventListener('mouseup', this.removePointerFromTracking)
		document.body.addEventListener('mouseleave', this.clearPointers)
		document.body.addEventListener('touchcancel', this.clearPointers)

		this.ee.on('tap', this.props.onTap || emptyFunction)
		this.ee.on('doubletap', this.props.onDoubleTap || emptyFunction)
		this.ee.on('pan', this.props.onPan || emptyFunction)
		this.ee.on('panstart', this.props.onPanStart || emptyFunction)
		this.ee.on('panend', this.props.onPanEnd || emptyFunction)
		this.ee.on('pinch', this.props.onPinch || emptyFunction)
		this.ee.on('rotate', this.props.onRotate || emptyFunction)
		this.ee.on('pressdown', this.props.onPressDown || emptyFunction)
		this.ee.on('pressup', this.props.onPressUp || emptyFunction)
	}

	componentWillUnmount() {
		this.container.removeEventListener('touchstart', this.addPointerToTracking)
		this.container.removeEventListener('touchend', this.removePointerFromTracking)
		this.container.removeEventListener('touchmove', this.recalc)
		this.container.removeEventListener('mousedown', this.addPointerToTracking)
		document.body.removeEventListener('mouseup', this.removePointerFromTracking)
		document.body.removeEventListener('mousemove', this.recalc)

		clearInterval(this.thresholdResetIntervalID)
	}

	recalc(e) {
		const { activePointers } = this.pointersState

		if (e instanceof MouseEvent) {
			const { clientX, clientY, timeStamp, target } = e
			const activePointer = activePointers[0]

			if (activePointer) {
				this.handleMove({
					clientX,
					clientY,
					target,
					timeStamp,
					pointerId: 0,
					pointerType: 'mouse',
					srcEvent: e
				})
				this.handlePan(e)
			}
			return
		}

		const { changedTouches, timeStamp } = e
		e.preventDefault()
		const pointersLength = activePointers.length
		let changedActivePointers = 0

		Array.prototype.map.call(changedTouches, changedTouch => {
			const { clientX, clientY, identifier, target } = changedTouch

			changedActivePointers += this.handleMove({
				clientX,
				clientY,
				timeStamp,
				target,
				pointerId: identifier,
				pointerType: 'touch',
				srcEvent: e
			})
		})

		if (changedActivePointers > 0) {
			if ( pointersLength === 1 ) {
				return this.handlePan(e)
			}

			if ( pointersLength > 1 ) {
				return this.handlePinch(e)
			}
		}
	}

	addPointerToTracking(e) {
		const { activePointers, session } = this.pointersState

		if (e instanceof MouseEvent) {
			const { target, clientX, clientY, timeStamp } = e

			this.handleAdd({
				target,
				clientX,
				clientY,
				timeStamp,
				pointerId: 0,
				pointerType: 'mouse',
				srcEvent: e
			})
			this.updateSession(timeStamp)
			return
		}

		const { changedTouches, timeStamp } = e
		Array.prototype.map.call(changedTouches, changedTouch => {
			const { target, identifier, clientX, clientY } = changedTouch
			const activePointer = activePointers[identifier]

			this.handleAdd({
				target,
				clientX,
				clientY,
				timeStamp,
				pointerId: identifier,
				pointerType: 'touch',
				srcEvent: e
			})
		})

		this.updateSession(timeStamp)
	}

	removePointerFromTracking(e) {
		const { activePointers, session } = this.pointersState

		if (e instanceof MouseEvent) {
			const { target, clientX, clientY, timeStamp } = e

			this.handleRemove({
				target,
				clientX,
				clientY,
				pointerId: 0,
				pointerType: 'mouse',
				timeStamp,
				srcEvent: e
			})

			this.updateSession(timeStamp)
			return
		}

		const { changedTouches, timeStamp } = e
		e.preventDefault() //prevent default behavior when fast touchend triggers mouse for click event

		Array.prototype.map.call(changedTouches, changedTouch => {
			const { target, identifier, clientX, clientY } = changedTouch

			this.handleRemove({
				target,
				timeStamp,
				clientX,
				clientY,
				pointerId: identifier,
				pointerType: 'touch',
				srcEvent: e
			})
		})

		this.updateSession(timeStamp)

	}

	clearPointers() {
		this.pointersState.activePointers = {}
		Object.defineProperty(this.pointersState.activePointers, 'length', {
			value: 0,
			enumerable: false,
			writable: true,
			configurable: true
		})
	}

	render() {
		const { children } = this.props

		return pug`
			Fragment
				${ children }
		`
	}
}
