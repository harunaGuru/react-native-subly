import { formatCurrency, formatStatusLabel, formatSubscriptionDateTime } from '@/lib/utils'
import clsx from 'clsx'
import React from 'react'
import { Image, Pressable, Text, View } from 'react-native'

const SubscriptionCard = ({ name, renewalDate, category, price, icon, currency, color, plan, expanded, onPress, paymentMethod, billing, startDate, status }: SubscriptionCardProps) => {
  return (
    <Pressable onPress={onPress} className={clsx('sub-card', expanded ? 'sub-card-expanded' : 'bg-card')} style={!expanded && color ? { backgroundColor: color } : undefined}>
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icon} className="sub-icon" />
          <View className="sub-copy">
            <Text className="sub-title" numberOfLines={1}>{name}</Text>
            <Text ellipsizeMode='tail' className="sub-meta" numberOfLines={1}>{category?.trim() || plan?.trim() || (renewalDate ? formatSubscriptionDateTime(renewalDate) : "")}</Text>
          </View>
        </View>
        <View className="sub-price-box">
          <Text className="sub-price">{formatCurrency(price, currency)}</Text>
          <Text className="sub-billing">{billing}</Text>
        </View>
      </View>
      {expanded && (
        <View className='sub-body'>
          <View className='sub-details'>
            <View className='sub-row'>
              <View className='sub-row-copy'>
                <Text className='sub-label'>Payment:</Text>
                <Text ellipsizeMode='tail' className='sub-value' numberOfLines={1}>{paymentMethod?.trim() || "Not Provided"}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='sub-row-copy'>
                <Text className='sub-label'>Category:</Text>
                <Text ellipsizeMode='tail' className='sub-value' numberOfLines={1}>{(category?.trim() || plan?.trim()) || "Not Provided"}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='sub-row-copy'>
                <Text className='sub-label'>Started:</Text>
                <Text ellipsizeMode='tail' className='sub-value' numberOfLines={1}>{startDate ? formatSubscriptionDateTime(startDate) : ""}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='sub-row-copy'>
                <Text className='sub-label'>Renewal Date:</Text>
                <Text ellipsizeMode='tail' className='sub-value' numberOfLines={1}>{renewalDate ? formatSubscriptionDateTime(renewalDate) : ""}</Text>
              </View>
            </View>
            <View className='sub-row'>
              <View className='sub-row-copy'>
                <Text className='sub-label'>Status:</Text>
                <Text ellipsizeMode='tail' className='sub-value' numberOfLines={1}>{status ? formatStatusLabel(status) : ""}</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  )
}

export default SubscriptionCard