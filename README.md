# Pointer

## Демо
```
http://shom.me/pointer-test
```

## Список событий
* onTap
* onDoubleTap
* onPan
* onPanStart
* onPanEnd
* onPinch
* onRotate
* onPressDown
* onPressUp
* onRotate

## Как использовать
```
<div className="test-container"
	<Pointer
		onTap=this.onTap
		onDoubleTap=this.onDoubleTap
		onPan=this.onPan
		onPanEnd=this.onPanEnd
		onPanStart=this.onPanStart
		onPinch=this.onPinch
		onPress=this.onPress
		onRotate=this.onRotate
		onPressDown=this.onPressDown
		onPressUp=this.onPressUp
	>
		<div className="test"></div>
	</Pointer>
</div>
```



## Данные объекта события (Basic)

### session
Начальные значения для текущей pointer-сессии (обновляются при каждом добавлении/исключении поинтера)
### deltaX
Изменение координаты x относительно предыдущего event'а
### deltaY
Изменение координаты y относительно предыдущего event'а
### distance
Расстояние от начала движения до текущей точки/центра точек
### pointerId
Идентификатор поинтера, для мыши всегда 0, для тачей — touch.identifier
### pointerType
Тип поинтера: 'touch' или 'mouse'
### srcEvent
TouchEvent или MouseEvent
### type
'pan'/'pinch'/'rotate'/'pressdown'/'pressup'/'panstart'/'panend'/'tap'/'doubletap'
### clientX
clientX
### clientY
clientY
### target
target
### timeStamp
Время


## Данные объекта события (Not Basic)
### center
Центр между всеми активными поинтерами
### scale
Коэффициент отношения между начальным радиусом и текущим
### deltaScale
Изменение scale относительно предыдущего event'а
### rotation
Угол поворота по кругу
### deltaRotation
Изменение rotation относительно предыдущего event'а
### pointers
Данные по каждому активному поинтеру в момент триггера event'а

#### Здесь был Антон
